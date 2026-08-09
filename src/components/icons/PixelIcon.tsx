/* 10×10 flat-color pixel icons, ported directly from portfolio-os-mockup.html's
   inline <svg> blocks (architecture.md §6, SPIKE-10). One per AppType. */

import type { ReactNode } from 'react'
import type { AppType } from '../../types/os'

const SHAPES: Record<AppType, ReactNode> = {
  about: (
    <>
      <rect x="2" y="1" width="6" height="8" fill="var(--paper)" />
      <rect x="6" y="1" width="2" height="2" fill="var(--ink)" />
      <rect x="3" y="4" width="4" height="0.7" fill="var(--magenta)" />
      <rect x="3" y="5.4" width="4" height="0.7" fill="var(--magenta)" />
      <rect x="3" y="6.8" width="2.5" height="0.7" fill="var(--magenta)" />
    </>
  ),
  projects: (
    <>
      <rect x="1" y="2" width="4" height="1" fill="var(--cyan)" />
      <rect x="1" y="3" width="8" height="5" fill="var(--cyan)" />
    </>
  ),
  resume: (
    <>
      <rect x="1" y="1" width="8" height="8" fill="var(--yellow)" />
      <rect x="3" y="1" width="3" height="2" fill="var(--ink)" />
      <rect x="2.5" y="5" width="5" height="3" fill="var(--ink)" />
    </>
  ),
  contact: (
    <>
      <rect x="1" y="2" width="8" height="6" fill="var(--green)" />
      <rect x="1" y="3.6" width="8" height="0.6" fill="var(--ink)" />
      <rect x="4.5" y="4.6" width="1" height="1" fill="var(--ink)" />
    </>
  ),
  terminal: (
    <>
      <rect x="1" y="1" width="8" height="8" fill="var(--cyan)" />
      <rect x="2" y="2" width="6" height="6" fill="var(--ink)" />
      <rect x="3" y="6" width="1" height="1" fill="var(--green)" />
      <rect x="4.5" y="6" width="1" height="1" fill="var(--green)" />
    </>
  ),
}

export function PixelIcon({ variant }: { variant: AppType }) {
  return (
    <svg viewBox="0 0 10 10" shapeRendering="crispEdges" aria-hidden="true">
      {SHAPES[variant]}
    </svg>
  )
}
