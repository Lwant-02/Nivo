import { useCallback, useEffect, useState } from 'react'

interface UseNotesReturn {
  notes: Note[]
  ready: boolean
  refresh: () => Promise<void>
  createNote: (patch?: NoteInput) => Promise<Note | null>
  updateNote: (id: string, patch: NoteInput) => Promise<Note | null>
  deleteNote: (id: string) => Promise<void>
}

export function useNotes(): UseNotesReturn {
  const [notes, setNotes] = useState<Note[]>([])
  const [ready, setReady] = useState(false)

  const refresh = useCallback(async () => {
    const list = await window.api.getNotes()
    setNotes(list ?? [])
    setReady(true)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const createNote = useCallback(async (patch?: NoteInput): Promise<Note | null> => {
    const created = await window.api.createNote(patch)
    if (created) setNotes((prev) => [created, ...prev])
    return created
  }, [])

  const updateNote = useCallback(
    async (id: string, patch: NoteInput): Promise<Note | null> => {
      const updated = await window.api.updateNote(id, patch)
      if (!updated) return null
      setNotes((prev) => {
        const next = prev.filter((n) => n.id !== id)
        return [updated, ...next].sort((a, b) => b.updatedAt - a.updatedAt)
      })
      return updated
    },
    []
  )

  const deleteNote = useCallback(async (id: string): Promise<void> => {
    const ok = await window.api.deleteNote(id)
    if (ok) setNotes((prev) => prev.filter((n) => n.id !== id))
  }, [])

  return { notes, ready, refresh, createNote, updateNote, deleteNote }
}
