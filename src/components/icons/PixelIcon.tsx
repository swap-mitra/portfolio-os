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
  /* A briefcase: handle, body, and the clasp line across the middle.
     Magenta because no other desktop icon uses it as a fill, so the new
     entry reads as its own thing in the column. */
  experience: (
    <>
      <rect x="3.5" y="1" width="3" height="1.2" fill="var(--magenta)" />
      <rect x="1" y="2.2" width="8" height="6.8" fill="var(--magenta)" />
      <rect x="1" y="5" width="8" height="0.7" fill="var(--ink)" />
      <rect x="4.3" y="4.5" width="1.4" height="1.7" fill="var(--ink)" />
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
  /* A bin: tapered body, lid, and two slats. Same 10x10 grid and flat-fill
     idiom as the rest, so it sits in the icon row without special casing. */
  recyclebin: (
    <>
      <rect x="1.5" y="1" width="7" height="1.2" fill="var(--paper)" />
      <rect x="4" y="0.2" width="2" height="0.8" fill="var(--paper)" />
      <rect x="2" y="2.4" width="6" height="6.6" fill="var(--paper)" />
      <rect x="3.4" y="3.6" width="0.9" height="4.2" fill="var(--ink)" />
      <rect x="5.7" y="3.6" width="0.9" height="4.2" fill="var(--ink)" />
    </>
  ),
  /* A mine: round body, four spikes, and the glint the original's bitmap
     had. Reads at 34px on the desktop and at 22px in a window. */
  minesweeper: (
    <>
      <rect x="4.5" y="0.5" width="1" height="9" fill="var(--paper)" />
      <rect x="0.5" y="4.5" width="9" height="1" fill="var(--paper)" />
      <rect x="3" y="2" width="4" height="6" fill="var(--paper)" />
      <rect x="2" y="3" width="6" height="4" fill="var(--paper)" />
      <rect x="3.5" y="3.5" width="1.2" height="1.2" fill="var(--ink)" />
    </>
  ),
  /* A face mid-laugh: eyes screwed shut into two dashes, mouth wide open.
     Yellow so it reads as the odd one out on the desktop, which it is. */
  jokes: (
    <>
      <rect x="2" y="1" width="6" height="8" fill="var(--yellow)" />
      <rect x="1" y="2" width="8" height="6" fill="var(--yellow)" />
      <rect x="2.5" y="3.2" width="1.8" height="0.8" fill="var(--ink)" />
      <rect x="5.7" y="3.2" width="1.8" height="0.8" fill="var(--ink)" />
      <rect x="3" y="5.4" width="4" height="2.2" fill="var(--ink)" />
      <rect x="3.8" y="6.8" width="2.4" height="0.9" fill="var(--magenta)" />
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
