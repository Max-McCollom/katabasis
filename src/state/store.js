import { create } from 'zustand'
import { playClose } from '../audio/cues.js'

// UI / interaction state shared between the 3D world and the DOM overlays.
export const useUI = create((set) => ({
  near: null, // id of the inspectable currently in range (shows a prompt)
  reading: null, // { id, title, paragraphs } when an inspection overlay is open
  game: null, // minigame id when a minigame is open
  paused: false, // controller paused (during read / game / cinematic move)

  setNear: (id) => set((s) => (s.near === id ? s : { near: id })),
  read: (payload) => set({ reading: payload, paused: true }),
  closeRead: () => {
    playClose()
    set({ reading: null, paused: false })
  },
  launch: (id) => set({ game: id, reading: null, paused: true }),
  exitGame: () => {
    playClose()
    set({ game: null, paused: false })
  },
}))
