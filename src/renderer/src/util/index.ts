export function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '-:--'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}
