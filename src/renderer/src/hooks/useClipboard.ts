import { useCallback, useEffect, useState } from 'react'

interface UseClipboardReturn {
  items: ClipboardItem[]
  ready: boolean
  refresh: () => Promise<void>
  copyItem: (id: string) => Promise<void>
  togglePin: (id: string) => Promise<void>
  deleteItem: (id: string) => Promise<void>
  clearAll: () => Promise<void>
}

export function useClipboard(): UseClipboardReturn {
  const [items, setItems] = useState<ClipboardItem[]>([])
  const [ready, setReady] = useState(false)

  const refresh = useCallback(async () => {
    const list = await window.api.getClipboard()
    setItems(list ?? [])
    setReady(true)
  }, [])

  useEffect(() => {
    refresh()
    const unsub = window.api.onClipboardUpdate((next) => {
      setItems(next ?? [])
    })
    return unsub
  }, [refresh])

  const copyItem = useCallback(async (id: string) => {
    await window.api.copyClipboardItem(id)
  }, [])

  const togglePin = useCallback(async (id: string) => {
    const updated = await window.api.toggleClipboardPin(id)
    if (!updated) return
    // Server broadcasts the new ordering, but update locally too for snappiness.
    setItems((prev) => {
      const next = prev.map((item) => (item.id === id ? updated : item))
      return [...next].sort((a, b) => {
        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
        return b.createdAt - a.createdAt
      })
    })
  }, [])

  const deleteItem = useCallback(async (id: string) => {
    const ok = await window.api.deleteClipboardItem(id)
    if (ok) setItems((prev) => prev.filter((item) => item.id !== id))
  }, [])

  const clearAll = useCallback(async () => {
    await window.api.clearClipboard()
    setItems((prev) => prev.filter((item) => item.pinned))
  }, [])

  return { items, ready, refresh, copyItem, togglePin, deleteItem, clearAll }
}
