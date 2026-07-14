import React, { lazy, Suspense } from 'react'

// The public dossier and the archived estate are separate bundles. A direct
// visit to the public site does not load the 3D dependencies, and /estate does
// not load the public-site stylesheet.
const EstateApp = lazy(() => import('./EstateApp.jsx'))
const PublicSite = lazy(() => import('./site/PublicSite.jsx'))

export default function App() {
  const path = typeof window !== 'undefined' ? window.location.pathname : '/'
  if (path === '/estate' || path.startsWith('/estate/')) {
    return (
      <Suspense fallback={null}>
        <EstateApp />
      </Suspense>
    )
  }
  return (
    <Suspense fallback={null}>
      <PublicSite />
    </Suspense>
  )
}
