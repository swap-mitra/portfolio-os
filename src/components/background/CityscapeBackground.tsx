/* The live neon cityscape (SPIKE-14): layered CSS/SVG parallax, no canvas and
   no video file. Each layer is two identical SVG tiles side by side inside a
   strip that translates by exactly one tile, so the loop is seamless; all of
   the animation is CSS, so the parallax runs on the compositor and costs no
   per-frame JavaScript. Geometry lives in skyline.ts. */

import { memo } from 'react'
import './CityscapeBackground.css'
import { Car } from './Car'
import { SKYLINE, TILE_WIDTH, type SkylineTile } from './skyline'

function Tile({ layer, buildings, windows }: SkylineTile) {
  return (
    <svg
      className="cityscape-tile"
      viewBox={`0 0 ${TILE_WIDTH} ${layer.height}`}
      preserveAspectRatio="none"
      shapeRendering="crispEdges"
    >
      {buildings.map((b) => (
        <rect key={b.x} x={b.x} y={b.y} width={b.w} height={b.h} fill={layer.fill} />
      ))}
      {windows.map((w) => (
        <rect
          key={`${w.x}-${w.y}`}
          className={w.flickerDelay === null ? undefined : 'cityscape-lit'}
          style={w.flickerDelay === null ? undefined : { animationDelay: `${w.flickerDelay}s` }}
          x={w.x}
          y={w.y}
          width={w.w}
          height={w.h}
          fill={layer.lit}
        />
      ))}
    </svg>
  )
}

/* memo, and it is not optional: `Desktop` re-renders on every MOVE_WINDOW, so
   without it React re-creates and diffs all ~750 of this scene's SVG rects on
   every pointer move of a window drag. Profiled at 5fps before, 60fps after
   (SPIKE-17). Nothing here depends on OS state, so the props-free memo can
   never go stale. */
export const CityscapeBackground = memo(function CityscapeBackground() {
  return (
    <div className="cityscape" aria-hidden="true">
      <div className="cityscape-glow" />
      {SKYLINE.map((tile) => (
        <div
          key={tile.layer.id}
          className="cityscape-layer"
          style={{
            // Offsets are measured from the top of the taskbar, not the window,
            // so the skyline can't end up hidden behind it.
            bottom: `calc(var(--taskbar-height) + ${tile.layer.bottom}px)`,
            height: `${tile.layer.height}px`,
          }}
        >
          <div className="cityscape-strip" style={{ animationDuration: `${tile.layer.durationS}s` }}>
            <Tile {...tile} />
            <Tile {...tile} />
          </div>
        </div>
      ))}
      <div className="cityscape-road" />
      <Car />
    </div>
  )
})
