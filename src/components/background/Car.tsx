/* Pixel car driving through the scene (SPIKE-15). Same crisp-edge SVG
   technique as the desktop icons, on its own layer in front of the skyline. */

import './Car.css'

export function Car() {
  return (
    <svg className="car" viewBox="0 0 24 10" shapeRendering="crispEdges" aria-hidden="true">
      <rect x="2" y="4" width="20" height="3" fill="var(--ink-3)" />
      <rect x="7" y="2" width="9" height="2" fill="var(--ink-3)" />
      <rect x="9" y="3" width="5" height="1" fill="var(--cyan)" />
      <rect x="5" y="7" width="3" height="2" fill="var(--ink-2)" />
      <rect x="16" y="7" width="3" height="2" fill="var(--ink-2)" />
      <rect x="22" y="4" width="2" height="2" fill="var(--yellow)" />
      <rect x="0" y="5" width="2" height="1" fill="var(--magenta)" />
    </svg>
  )
}
