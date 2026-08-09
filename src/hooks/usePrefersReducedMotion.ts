/* Reads the OS "reduce motion" setting and re-renders if it changes mid-visit
   (SPIKE-17). The decorative background handles reduced motion in CSS media
   queries instead, which is cheaper and applies before React mounts. This
   hook is for the cases where JavaScript has to branch, like skipping an
   animated sequence outright. */

import { useEffect, useState } from 'react'

const QUERY = '(prefers-reduced-motion: reduce)'

export function usePrefersReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState(() => window.matchMedia(QUERY).matches)

  useEffect(() => {
    const list = window.matchMedia(QUERY)
    const onChange = (event: MediaQueryListEvent) => setPrefersReduced(event.matches)
    list.addEventListener('change', onChange)
    return () => list.removeEventListener('change', onChange)
  }, [])

  return prefersReduced
}
