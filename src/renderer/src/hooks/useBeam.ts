import { useCallback, useEffect, useState } from 'react'

interface UseBeamReturn {
  tiles: BeamTile[]
  ready: boolean
  refresh: () => Promise<void>
  createTile: (input: BeamTileInput) => Promise<BeamTile | null>
  updateTile: (
    id: string,
    patch: { label?: string; target?: string; icon?: string | null }
  ) => Promise<BeamTile | null>
  deleteTile: (id: string) => Promise<void>
  reorderTiles: (ids: string[]) => Promise<void>
  launchTile: (id: string) => Promise<boolean>
}

export function useBeam(): UseBeamReturn {
  const [tiles, setTiles] = useState<BeamTile[]>([])
  const [ready, setReady] = useState(false)

  const refresh = useCallback(async () => {
    const list = await window.api.getBeamTiles()
    setTiles(list ?? [])
    setReady(true)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const createTile = useCallback(async (input: BeamTileInput) => {
    const created = await window.api.createBeamTile(input)
    if (created) setTiles((prev) => [...prev, created])
    return created
  }, [])

  const updateTile = useCallback(
    async (
      id: string,
      patch: { label?: string; target?: string; icon?: string | null }
    ) => {
      const updated = await window.api.updateBeamTile(id, patch)
      if (updated) setTiles((prev) => prev.map((t) => (t.id === id ? updated : t)))
      return updated
    },
    []
  )

  const deleteTile = useCallback(async (id: string) => {
    const ok = await window.api.deleteBeamTile(id)
    if (ok) setTiles((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const reorderTiles = useCallback(async (ids: string[]) => {
    const next = await window.api.reorderBeamTiles(ids)
    setTiles(next ?? [])
  }, [])

  const launchTile = useCallback(async (id: string) => {
    return window.api.launchBeamTile(id)
  }, [])

  return {
    tiles,
    ready,
    refresh,
    createTile,
    updateTile,
    deleteTile,
    reorderTiles,
    launchTile
  }
}
