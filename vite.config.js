import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Sealed, static build. No backend, no external fetches at runtime, and no
// source maps in production (they would embed local paths and the directory
// structure). The build reads only from inside this tree, so its output is a
// subset of cleared source by construction.
export default defineConfig({
  plugins: [react()],
  // A 3D dep was resolving its own React copy, breaking hooks in the minigame.
  // Force a single React instance across the graph.
  resolve: { dedupe: ['react', 'react-dom'] },
  build: {
    sourcemap: false,
    target: 'es2020',
  },
})
