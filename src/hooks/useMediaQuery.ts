/* One media query, subscribed. Extracted when SPIKE-30 needed a second one
   and would otherwise have copied usePrefersReducedMotion wholesale. */

import { useEffect, useState } from 'react'

/** True while `query` matches, re-rendering when that changes mid-visit (a
    rotated tablet, a dragged window edge, an OS setting toggled). */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches)

  useEffect(() => {
    const list = window.matchMedia(query)
    // Re-read on subscribe: the query can have changed between the initial
    // render and this effect.
    setMatches(list.matches)
    const onChange = (event: MediaQueryListEvent) => setMatches(event.matches)
    list.addEventListener('change', onChange)
    return () => list.removeEventListener('change', onChange)
  }, [query])

  return matches
}
