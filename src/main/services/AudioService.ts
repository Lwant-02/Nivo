import { BrowserWindow } from 'electron'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export type AudioDeviceKind = 'airpods' | 'headset' | 'speakers'

export interface AudioOutputUpdate {
  device: string
  kind: AudioDeviceKind
}

const HEADSET_KEYWORDS = ['headphones', 'bluetooth', 'beats', 'buds', 'headset']

function classifyKind(name: string, transport?: string, minorType?: string): AudioDeviceKind {
  const lowerName = name.toLowerCase()
  const lowerMinor = (minorType || '').toLowerCase()

  // 1. AirPods/Beats Priority (Name-based)
  if (lowerName.includes('airpods') || lowerName.includes('beats')) {
    return 'airpods'
  }

  // 2. Headset/Headphones (Minor Type based)
  if (
    lowerMinor.includes('headphones') ||
    lowerMinor.includes('headset') ||
    transport === 'coreaudio_device_type_bluetooth'
  ) {
    return 'headset'
  }

  // 3. Fallback
  if (HEADSET_KEYWORDS.some((k) => lowerName.includes(k))) return 'headset'

  return 'speakers'
}

export class AudioService {
  private mainWindow: BrowserWindow | null = null
  private pollingInterval: NodeJS.Timeout | null = null
  private isPolling = false
  private lastState: AudioOutputUpdate = { device: '', kind: 'speakers' }
  private deviceMetaCache = new Map<string, { minorType?: string; ts: number }>()

  public start(window: BrowserWindow): void {
    if (this.pollingInterval) clearInterval(this.pollingInterval)
    this.mainWindow = window
    this.poll(true)
    this.pollingInterval = setInterval(() => this.poll(), 2500)
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
      const info = await this.getCurrentOutputInfo()
      if (!info) return

      const meta = await this.getDeviceMeta(info.device)
      
      const effectiveTransport = info.transport || (meta ? 'coreaudio_device_type_bluetooth' : undefined)
      const kind = classifyKind(info.device, effectiveTransport, meta?.minorType)

      if (force || info.device !== this.lastState.device || kind !== this.lastState.kind) {
        this.lastState = { device: info.device, kind }
        this.mainWindow.webContents.send('audio-output-update', this.lastState)
      }
    } catch (err: any) {
      console.error('[AudioService] Poll failed:', err.message)
    } finally {
      this.isPolling = false
    }
  }

  private async getCurrentOutputInfo(): Promise<{ device: string; transport?: string } | null> {
    try {
      const { stdout } = await execAsync(
        `osascript -e "output name of (get volume settings)"`,
        { timeout: 1500 }
      )
      const name = stdout.trim()
      if (name && name !== 'missing value') {
        const sysInfo = await this.getDefaultOutputFromSystemProfiler()
        if (sysInfo && sysInfo.device.trim().toLowerCase() === name.toLowerCase()) {
          return sysInfo
        }
        return { device: name }
      }
    } catch {
      // expected on macOS versions where the property isn't exposed
    }
    return this.getDefaultOutputFromSystemProfiler()
  }

  private async getDefaultOutputFromSystemProfiler(): Promise<{
    device: string
    transport?: string
  } | null> {
    try {
      const { stdout } = await execAsync('system_profiler SPAudioDataType -json', {
        maxBuffer: 8 * 1024 * 1024,
        timeout: 5000
      })
      const data = JSON.parse(stdout)
      return findDefaultOutput(data)
    } catch {
      return null
    }
  }

  private async getDeviceMeta(deviceName: string): Promise<{ minorType?: string } | null> {
    if (!deviceName) return null
    const cached = this.deviceMetaCache.get(deviceName)
    if (cached && Date.now() - cached.ts < 30000) {
      return { minorType: cached.minorType }
    }

    try {
      const meta = await this.fetchDeviceMetaFromSystemProfiler(deviceName)
      this.deviceMetaCache.set(deviceName, {
        minorType: meta?.minorType,
        ts: Date.now()
      })
      return meta
    } catch {
      return cached ? { minorType: cached.minorType } : null
    }
  }

  private async fetchDeviceMetaFromSystemProfiler(targetName: string): Promise<{ minorType?: string } | null> {
    try {
      const { stdout } = await execAsync('system_profiler SPBluetoothDataType -json', {
        maxBuffer: 8 * 1024 * 1024,
        timeout: 5000
      })
      const data = JSON.parse(stdout)
      const root = Array.isArray(data?.SPBluetoothDataType) ? data.SPBluetoothDataType[0] : null
      if (!root) return null

      const connectedRaw = root.device_connected || root.device_connected_v2 || root.devices_list || []
      const targetLower = targetName.trim().toLowerCase()

      for (const entry of connectedRaw) {
        if (entry && typeof entry === 'object' && !Array.isArray(entry)) {
          for (const [name, attrs] of Object.entries(entry)) {
            const namedAttrs = attrs as Record<string, unknown> | null
            if (!namedAttrs || typeof namedAttrs !== 'object') continue

            const candidateName = String(namedAttrs.device_name ?? name).trim().toLowerCase()
            if (
              candidateName === targetLower ||
              candidateName.includes(targetLower) ||
              targetLower.includes(candidateName)
            ) {
              return { minorType: namedAttrs.device_minorType as string | undefined }
            }
          }
        }
      }
    } catch {
      // ignore
    }
    return null
  }
}

function findDefaultOutput(node: unknown): { device: string; transport?: string } | null {
  if (!node) return null
  if (Array.isArray(node)) {
    for (const item of node) {
      const found = findDefaultOutput(item)
      if (found) return found
    }
    return null
  }
  if (typeof node === 'object') {
    const obj = node as Record<string, unknown>
    if (obj.coreaudio_default_audio_output_device === 'spaudio_yes' && typeof obj._name === 'string') {
      return {
        device: obj._name,
        transport: obj.coreaudio_device_transport as string | undefined
      }
    }
    for (const value of Object.values(obj)) {
      const found = findDefaultOutput(value)
      if (found) return found
    }
  }
  return null
}
