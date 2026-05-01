import { useEffect, useRef } from 'react'

// Vite glob imports for all sound pack configurations and audio files.
const CONFIGS = import.meta.glob('../assets/sonic-sounds/*/config.json', {
  eager: true,
  import: 'default'
})
const SOUNDS = import.meta.glob('../assets/sonic-sounds/*/*.ogg', {
  eager: true,
  import: 'default'
})

let sharedContext: AudioContext | null = null
let currentBuffer: AudioBuffer | null = null
let currentSpriteMap: Record<string, [number, number]> | null = null

function getAudioContext(): AudioContext {
  if (sharedContext) return sharedContext
  sharedContext = new AudioContext({ latencyHint: 'interactive' })
  return sharedContext
}

async function loadSoundPack(packId: string): Promise<void> {
  const ctx = getAudioContext()

  // Find the config for this pack
  const configPath = `../assets/sonic-sounds/${packId}/config.json`
  const config = CONFIGS[configPath] as any
  if (!config) throw new Error(`Sonic sound pack config not found: ${packId}`)

  // Find the sound file for this pack
  const soundFileName = config.sound
  const soundPath = `../assets/sonic-sounds/${packId}/${soundFileName}`
  const soundUrl = SOUNDS[soundPath] as string
  if (!soundUrl) throw new Error(`Sonic sound file not found: ${soundPath}`)

  const response = await fetch(soundUrl)
  const arrayBuffer = await response.arrayBuffer()
  const audioBuffer = await ctx.decodeAudioData(arrayBuffer)

  currentBuffer = audioBuffer
  currentSpriteMap = config.defines
}

export function useSonicFeedback(enabled: boolean, soundPackId: SonicSoundPackId): void {
  const enabledRef = useRef(enabled)
  enabledRef.current = enabled

  useEffect(() => {
    if (!enabled) return

    loadSoundPack(soundPackId).catch((err) => {
      console.error('[SonicFeedback] failed to load sound pack:', soundPackId, err)
    })

    const off = window.api.onSonicKey((keycode) => {
      if (!enabledRef.current) return
      const ctx = getAudioContext()
      const buffer = currentBuffer
      const spriteMap = currentSpriteMap

      if (!buffer || !spriteMap) return

      const sprite = spriteMap[String(keycode)]
      if (!sprite) return

      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {})
      }

      const [startMs, durationMs] = sprite
      const source = ctx.createBufferSource()
      source.buffer = buffer
      source.connect(ctx.destination)
      source.start(0, startMs / 1000, durationMs / 1000)
    })

    return () => {
      off()
    }
  }, [enabled, soundPackId])
}
