/* Faint twinkling starfield, ported from the mockup's inline script (SPIKE-16).
   Positions are drawn once at module load rather than per render, so React
   re-renders and StrictMode's double-render can't reshuffle the sky. */

import { memo } from 'react'
import '../../styles/crt-effects.css'

const STAR_COUNT = 40

/* Only some of them twinkle, and this is the one performance compromise Phase 4
   made in the art rather than the code. 40 elements animating opacity measured
   as the most expensive thing on the desktop by a wide margin, more than the
   entire cityscape (SPIKE-17). Nobody can follow 40 twinkles at once, so the
   star density stays and the animation count drops. */
const TWINKLING = 12

/* The mockup scattered stars over the top 90% of a flat background. The bottom
   of the viewport is now skyline, so stars there would sit inside buildings.
   They're confined to the top 60%, above the tallest layer (SPIKE-16). */
const STARS = Array.from({ length: STAR_COUNT }, (_, i) => ({
  twinkles: i < TWINKLING,
  style: {
    top: `${Math.random() * 60}%`,
    left: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 3.5}s`,
  },
}))

/* memo for the same reason as CityscapeBackground: none of this depends on OS
   state, and re-creating 40 star elements per pointer move is pure waste. */
export const Starfield = memo(function Starfield() {
  return (
    <div className="starfield" aria-hidden="true">
      {STARS.map((star, i) => (
        <div key={i} className={star.twinkles ? 'star star--twinkle' : 'star'} style={star.style} />
      ))}
    </div>
  )
})
