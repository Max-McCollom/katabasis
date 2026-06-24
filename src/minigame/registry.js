import Astrolabe from './Astrolabe.jsx'
import Braziers from './Braziers.jsx'

// Drop-in registry: an inspectable launches a minigame by id. Add a new entry
// (id -> { title, Component }) and wire an inspectable to it; nothing else
// changes. One complete game is built this run; the rest is plumbing.
export const MINIGAMES = {
  astrolabe: { title: 'The Astrolabe Lock', Component: Astrolabe },
  braziers: { title: 'The Nine Braziers', Component: Braziers },
}
