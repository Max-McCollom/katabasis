import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Progress that survives reload: which chapters have been read, which minigames
// solved. Persisted to localStorage via zustand's persist middleware.
export const useProgress = create(
  persist(
    (set) => ({
      read: {},
      solved: {},
      markRead: (id) => set((s) => (s.read[id] ? s : { read: { ...s.read, [id]: true } })),
      markSolved: (id) => set((s) => (s.solved[id] ? s : { solved: { ...s.solved, [id]: true } })),
      reset: () => set({ read: {}, solved: {} }),
    }),
    { name: 'katabasis-progress' },
  ),
)
