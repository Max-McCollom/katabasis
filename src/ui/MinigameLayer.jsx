import React from 'react'
import { useUI } from '../state/store.js'
import { MINIGAMES } from '../minigame/registry.js'

export default function MinigameLayer() {
  const game = useUI((s) => s.game)
  const entry = game && MINIGAMES[game]
  if (!entry) return null
  const C = entry.Component
  return <C />
}
