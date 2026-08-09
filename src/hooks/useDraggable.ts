/* Reusable drag mechanics via the Pointer Events API — one code path for
   mouse, touch, and pen (architecture.md §5, SPIKE-06). */

import { useCallback, useRef } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'

/** How much of the title bar must stay reachable on-screen, so it can
    always be grabbed back (architecture.md §5: "can't be dragged fully
    off-screen"). */
const MIN_VISIBLE = 40

export interface DraggableHandlers {
  onPointerDown: (e: ReactPointerEvent<HTMLElement>) => void
  onPointerMove: (e: ReactPointerEvent<HTMLElement>) => void
  onPointerUp: (e: ReactPointerEvent<HTMLElement>) => void
  onPointerCancel: (e: ReactPointerEvent<HTMLElement>) => void
}

/** Pure so it's testable without a DOM or a live pointer sequence. */
export function clampDragPosition(
  rawX: number,
  rawY: number,
  width: number,
  viewport: { width: number; height: number },
): { x: number; y: number } {
  return {
    x: Math.min(Math.max(rawX, MIN_VISIBLE - width), viewport.width - MIN_VISIBLE),
    y: Math.min(Math.max(rawY, 0), viewport.height - MIN_VISIBLE),
  }
}

/** Attach the returned handlers to a drag handle (the title bar). `getBounds`
    is read fresh on pointerdown rather than closed over, so the hook doesn't
    need to be recreated every time the window moves. */
export function useDraggable(
  onDrag: (x: number, y: number) => void,
  getBounds: () => { x: number; y: number; width: number },
): DraggableHandlers {
  const offset = useRef({ x: 0, y: 0 })

  const onPointerDown = useCallback(
    (e: ReactPointerEvent<HTMLElement>) => {
      if (e.button !== 0) return
      const bounds = getBounds()
      offset.current = { x: e.clientX - bounds.x, y: e.clientY - bounds.y }
      e.currentTarget.setPointerCapture(e.pointerId)
    },
    [getBounds],
  )

  const onPointerMove = useCallback(
    (e: ReactPointerEvent<HTMLElement>) => {
      if (!e.currentTarget.hasPointerCapture(e.pointerId)) return
      const { width } = getBounds()
      const { x, y } = clampDragPosition(e.clientX - offset.current.x, e.clientY - offset.current.y, width, {
        width: window.innerWidth,
        height: window.innerHeight,
      })
      onDrag(x, y)
    },
    [getBounds, onDrag],
  )

  const onPointerUp = useCallback((e: ReactPointerEvent<HTMLElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId)
  }, [])

  return { onPointerDown, onPointerMove, onPointerUp, onPointerCancel: onPointerUp }
}
