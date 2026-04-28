import { BrowserWindow } from 'electron'
import { uIOhook, UiohookKeyboardEvent } from 'uiohook-napi'

// Forwards global keydown events from libuiohook to the renderer over IPC so
// the Web Audio engine can play a low-latency sprite sound. The hook is only
// running when Sonic Feedback is enabled — we don't want a global keystroke
// listener active otherwise.
export class SonicFeedbackService {
  private hookRunning = false
  private listenerAttached = false
  private getWindow: () => BrowserWindow | null
  private readonly handleKeyDown = (event: UiohookKeyboardEvent): void => {
    const win = this.getWindow()
    if (!win || win.isDestroyed()) return
    win.webContents.send('sonic-key', event.keycode)
  }

  constructor(getWindow: () => BrowserWindow | null) {
    this.getWindow = getWindow
  }

  start(): void {
    if (this.hookRunning) return
    if (!this.listenerAttached) {
      uIOhook.on('keydown', this.handleKeyDown)
      this.listenerAttached = true
    }
    try {
      uIOhook.start()
      this.hookRunning = true
    } catch (err) {
      // Most commonly fails on macOS when Accessibility permission has not been
      // granted. We log once and keep the listener attached so the next start()
      // attempt — e.g. after the user grants permission — can succeed.
      console.warn('[SonicFeedback] Failed to start global key hook:', (err as Error).message)
    }
  }

  stop(): void {
    if (!this.hookRunning) return
    try {
      uIOhook.stop()
    } catch (err) {
      console.warn('[SonicFeedback] Failed to stop global key hook:', (err as Error).message)
    }
    this.hookRunning = false
  }

  dispose(): void {
    this.stop()
    if (this.listenerAttached) {
      uIOhook.off('keydown', this.handleKeyDown)
      this.listenerAttached = false
    }
  }
}
