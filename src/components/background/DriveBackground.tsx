/* The desktop background: an endless synthwave drive on a canvas.

   Replaces the parallax cityscape and the CSS starfield, both of which the
   scene subsumes: it draws its own stars, and two backgrounds layered on top
   of each other is just noise.

   No `.desktop--paused` handling here, unlike the CSS layers. requestAnimation
   Frame already stops in a hidden tab, so the class that pauses CSS animations
   has nothing to do for a canvas. */

import { useEffect, useRef } from 'react'
import './DriveBackground.css'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import { createDriveScene, drawDriveFrame } from './driveScene'

/** Retina without the cost of a 3x buffer on the phones that claim it. */
const MAX_PIXEL_RATIO = 2

/** Longest step the scene will advance in one frame. Without it, returning to
    a backgrounded tab jumps the road forward by however long you were away. */
const MAX_STEP_SECONDS = 0.05

export function DriveBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reducedMotion = usePrefersReducedMotion()

  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas === null) return
    const ctx = canvas.getContext('2d')
    if (ctx === null) return

    const scene = createDriveScene()
    const pixelRatio = Math.min(MAX_PIXEL_RATIO, window.devicePixelRatio || 1)
    let width = 0
    let height = 0

    const resize = () => {
      width = canvas.clientWidth
      height = canvas.clientHeight
      canvas.width = Math.round(width * pixelRatio)
      canvas.height = Math.round(height * pixelRatio)
      // Resizing the buffer resets the context, so the scale goes back on.
      ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
      // A frozen scene still has to survive a window resize.
      if (reducedMotion) drawDriveFrame(ctx, scene, width, height, 0)
    }

    window.addEventListener('resize', resize)
    resize()

    /* Frozen rather than blank, per architecture.md §10: the art stays, the
       motion goes. Frame zero is a complete scene, not a half-drawn one. */
    if (reducedMotion) {
      return () => window.removeEventListener('resize', resize)
    }

    let frame = 0
    let elapsed = 0
    let last = performance.now()

    const loop = (now: number) => {
      elapsed += Math.min(MAX_STEP_SECONDS, (now - last) / 1000)
      last = now
      drawDriveFrame(ctx, scene, width, height, elapsed)
      frame = requestAnimationFrame(loop)
    }
    frame = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', resize)
    }
  }, [reducedMotion])

  return <canvas ref={canvasRef} className="drive" aria-hidden="true" />
}
