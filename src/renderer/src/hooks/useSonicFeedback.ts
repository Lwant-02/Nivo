import { useEffect, useRef } from 'react'
import sonicSoundUrl from '../assets/sounds/sound.ogg'
import sonicConfig from '../assets/sounds/config.json'

// Each keycode maps to a [startMs, durationMs] sprite slice inside sound.ogg.
const SPRITE_MAP = sonicConfig.defines as unknown as Record<string, [number, number]>

let sharedContext: AudioContext | null = null
let sharedBuffer: AudioBuffer | null = null
let bufferLoadPromise: Promise<AudioBuffer> | null = null

function getAudioContext(): AudioContext {
  if (sharedContext) return sharedContext
  // `interactive` asks the platform for the smallest viable buffer size.
  // Combined with Chromium's CoreAudio backend on macOS this lands ~5–10ms
  // total output latency on Apple Silicon.
  sharedContext = new AudioContext({ latencyHint: 'interactive' })
  return sharedContext
}

function loadSpriteBuffer(ctx: AudioContext): Promise<AudioBuffer> {
  if (sharedBuffer) return Promise.resolve(sharedBuffer)
  if (bufferLoadPromise) return bufferLoadPromise

  bufferLoadPromise = fetch(sonicSoundUrl)
    .then((r) => r.arrayBuffer())
    .then((bytes) => ctx.decodeAudioData(bytes))
    .then((buffer) => {
      sharedBuffer = buffer
      return buffer
    })
    .catch((err) => {
      bufferLoadPromise = null
      throw err
    })

  return bufferLoadPromise
}

export function useSonicFeedback(enabled: boolean): void {
  // Avoid stale-closure on rapid toggle: keep the live flag in a ref so the
  // single attached IPC listener can short-circuit without rewiring.
  const enabledRef = useRef(enabled)
  enabledRef.current = enabled

  useEffect(() => {
    if (!enabled) return

    const ctx = getAudioContext()

    loadSpriteBuffer(ctx).catch((err) => {
      console.error('[SonicFeedback] failed to decode sprite:', err)
    })

    const off = window.api.onSonicKey((keycode) => {
      if (!enabledRef.current) return
      const buffer = sharedBuffer
      if (!buffer) return

      const sprite = SPRITE_MAP[String(keycode)]
      if (!sprite) return

      // The notch window never receives a user gesture (it's non-focusable),
      // so the context can sit in 'suspended' until we kick it. The
      // autoplay-policy switch in main allows resume() without a gesture.
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {
          /* swallow — next keypress will retry */
        })
      }

      const [startMs, durationMs] = sprite
      const source = ctx.createBufferSource()
      source.buffer = buffer
      source.connect(ctx.destination)
      // Schedule slightly ahead of the audio clock for jitter-free start.
      source.start(0, startMs / 1000, durationMs / 1000)
    })

    return () => {
      off()
    }
  }, [enabled])
}
