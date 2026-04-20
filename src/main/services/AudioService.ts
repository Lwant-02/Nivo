import { BrowserWindow } from 'electron'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export type AudioDeviceKind = 'airpods' | 'headset' | 'speakers'

export interface AudioOutputUpdate {
  device: string
  kind: AudioDeviceKind
}

const HEADSET_KEYWORDS = [
  'headphones', 'bluetooth', 'beats', 'buds', 'headset', 'pods', 
  'pro', 'max', 'ugreen', 'sony', 'bose', 'hitune', 'wireless', 'hands-free'
]

function classifyKind(name: string, transport?: string, minorType?: string): AudioDeviceKind {
  const lowerName = name.trim().toLowerCase()
  const lowerMinor = (minorType || '').toLowerCase()

  // 1. AirPods Priority
  if (
    lowerName.includes('airpods') || 
    lowerName.includes('powerbeats') ||
    lowerName.includes('beats solo') ||
    lowerMinor.includes('headphones') && lowerName.includes('pro')
  ) {
    return 'airpods'
  }

  // 2. Headset Category (Technology-based)
  if (
    lowerMinor.includes('headset') ||
    lowerMinor.includes('headphones') ||
    (transport && transport.toLowerCase().includes('bluetooth')) ||
    (transport && transport.toLowerCase().includes('usb')) ||
    (transport && transport.toLowerCase().includes('airplay'))
  ) {
    if (lowerName.includes('speaker') && !lowerName.includes('headset')) {
       return 'speakers'
    }
    return 'headset'
  }

  // 3. Name-based Keyword Fallback
  if (HEADSET_KEYWORDS.some((k) => lowerName.includes(k))) return 'headset'

  // 4. Default to Speakers
  return 'speakers'
}

export class AudioService {
  private mainWindow: BrowserWindow | null = null
  private pollingInterval: NodeJS.Timeout | null = null
  private isPolling = false
  private lastState: AudioOutputUpdate = { device: '', kind: 'speakers' }
  private deviceMetaCache = new Map<string, { minorType?: string; transport?: string; ts: number }>()

  public getState(): AudioOutputUpdate {
    return this.lastState
  }

  public start(window: BrowserWindow): void {
    if (this.pollingInterval) clearInterval(this.pollingInterval)
    this.mainWindow = window
    this.poll(true)
    this.pollingInterval = setInterval(() => this.poll(), 3000) // Slightly slower poll for stability
  }

  public stop(): void {
    if (this.pollingInterval) clearInterval(this.pollingInterval)
    this.pollingInterval = null
  }

  private async poll(force = false): Promise<void> {
    if (!this.mainWindow || this.mainWindow.isDestroyed()) return
    if (this.isPolling) return
    this.isPolling = true

    try {
      // Get Default Device Info (Name and Transport)
      const deviceInfo = await this.getPrimaryOutputInfo()
      if (!deviceInfo) {
        this.isPolling = false
        return
      }

      const { device: deviceName, transport } = deviceInfo

      // Get Bluetooth Metadata if applicable
      let minorType: string | undefined
      if (transport?.toLowerCase().includes('bluetooth')) {
        const meta = await this.getDeviceMeta(deviceName)
        minorType = meta?.minorType
      }

      const kind = classifyKind(deviceName, transport, minorType)

      if (force || deviceName !== this.lastState.device || kind !== this.lastState.kind) {
        this.lastState = { device: deviceName, kind }
        this.mainWindow.webContents.send('audio-output-update', this.lastState)
        
        // Log to user terminal for verification
        console.log(`[AudioUpdate] active: "${deviceName}" | transport: ${transport || 'unknown'} | minor: ${minorType || 'none'} | kind: ${kind}`)
      }
    } catch (err: any) {
      console.error('[AudioService] Polled failed:', err.message)
    } finally {
      this.isPolling = false
    }
  }

  private async getPrimaryOutputInfo(): Promise<{ device: string; transport?: string } | null> {
    // 1. Try robust osascript first for CURRENT NAME
    let osascriptName: string | undefined
    try {
      const { stdout } = await execAsync(`osascript -e "output name of (get volume settings)"`, { timeout: 1500 })
      osascriptName = stdout.trim()
    } catch { /* ignore */ }

    // 2. Scan system profiling for TRANSPORT and FALLBACK NAME
    try {
      const { stdout } = await execAsync('system_profiler SPAudioDataType -json', { timeout: 10000 })
      const data = JSON.parse(stdout)
      const devices = parseAudioDevicesJSON(data)

      // Find the device marked as Default
      const defaultDevice = devices.find(d => d.isDefault)

      if (defaultDevice) {
        // If osascript failed or returned something generic, trust the profiler name
        const finalName = osascriptName && osascriptName !== 'missing value' ? osascriptName : defaultDevice.device
        return { device: finalName, transport: defaultDevice.transport }
      }
    } catch {
       // Regex fallback if JSON fails
       return this.getPrimaryOutputViaRegex()
    }

    return osascriptName ? { device: osascriptName } : null
  }

  private async getPrimaryOutputViaRegex(): Promise<{ device: string; transport?: string } | null> {
    try {
      const { stdout } = await execAsync('system_profiler SPAudioDataType', { timeout: 10000 })
      
      // Regex to find the block containing "Default Output Device: Yes"
      // Then extract the device name and transport from that block
      const blocks = stdout.split('\n\n')
      for (const block of blocks) {
        if (block.includes('Default Output Device: Yes')) {
          const nameMatch = block.match(/^\s+(.*?):$/m)
          const transportMatch = block.match(/Transport:\s+(.*)$/m)
          if (nameMatch) {
            return {
              device: nameMatch[1].trim(),
              transport: transportMatch ? transportMatch[1].trim() : undefined
            }
          }
        }
      }
    } catch { /* ignore */ }
    return null
  }

  private async getDeviceMeta(deviceName: string): Promise<{ minorType?: string } | null> {
    const cached = this.deviceMetaCache.get(deviceName)
    if (cached && Date.now() - cached.ts < 60000) return cached

    try {
      const { stdout } = await execAsync('system_profiler SPBluetoothDataType -json', { timeout: 10000 })
      const data = JSON.parse(stdout)
      const minorType = findMinorTypeInBTData(data, deviceName)
      const res = { minorType, ts: Date.now() }
      this.deviceMetaCache.set(deviceName, res)
      return res
    } catch {
      return cached || null
    }
  }
}

function parseAudioDevicesJSON(data: any): { device: string; transport?: string; isDefault: boolean }[] {
  const devices: any[] = []
  function scan(node: any) {
    if (!node) return
    if (Array.isArray(node)) { node.forEach(scan); return }
    if (typeof node === 'object') {
       if (node._name && (node.coreaudio_device_output || node.coreaudio_default_audio_output_device === 'spaudio_yes')) {
         devices.push({
           device: node._name,
           transport: node.coreaudio_device_transport,
           isDefault: node.coreaudio_default_audio_output_device === 'spaudio_yes'
         })
       }
       Object.values(node).forEach(scan)
    }
  }
  scan(data)
  return devices
}

function findMinorTypeInBTData(data: any, name: string): string | undefined {
  const target = name.toLowerCase().trim()
  const root = data?.SPBluetoothDataType?.[0]
  if (!root) return undefined
  const pools = [root.device_connected, root.device_connected_v2]
  for (const pool of pools) {
    if (!Array.isArray(pool)) continue
    for (const entry of pool) {
      for (const [key, val] of Object.entries(entry)) {
        const p = val as any
        const candidate = (p.device_name || key).toLowerCase().trim()
        if (candidate === target || target.includes(candidate) || candidate.includes(target)) {
           return p.device_minorType
        }
      }
    }
  }
  return undefined
}
