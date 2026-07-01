import React, { lazy, Suspense } from 'react'
import Cockpit from './cockpit/Cockpit.jsx'

// Code-split: the archived estate world (three.js + r3f + physics + audio +
// the chapter copy it renders) loads ONLY on /estate. The default Cockpit
// route ships none of it — every byte on '/' must be load-bearing.
const EstateApp = lazy(() => import('./EstateApp.jsx'))

export default function App() {
  const path = typeof window !== 'undefined' ? window.location.pathname : '/'
  if (path === '/estate' || path.startsWith('/estate/')) {
    return (
      <Suspense fallback={null}>
        <EstateApp />
      </Suspense>
    )
  }
  return <Cockpit />
}
