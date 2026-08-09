/* Reusable resize mechanics via the Pointer Events API — same pattern as
   useDraggable (architecture.md §5, SPIKE-07). */

import { useCallback } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'

export interface ResizableHandlers {
  onPointerDown: (e: ReactPointerEvent<HTMLElement>) => void
  onPointerMove: (e: ReactPointerEvent<HTMLElement>) => void
  onPointerUp: (e: ReactPointerEvent<HTMLElement>) => void
  onPointerCancel: (e: ReactPointerEvent<HTMLElement>) => void
}

/** Attach the returned handlers to the corner resize handle. `getOrigin` is
    the window's fixed top-left corner — size is computed relative to it, so
    resizing never touches x/y (architecture.md §5). */
export function useResizable(
  onResize: (width: number, height: number) => void,
  getOrigin: () => { x: number; y: number },
  min: { width: number; height: number },
): ResizableHandlers {
  const onPointerDown = useCallback((e: ReactPointerEvent<HTMLElement>) => {
    if (e.button !== 0) return
    // Stop this from also registering as a title-bar drag (SPIKE-07 step 5).
    e.stopPropagation()
    e.currentTarget.setPointerCapture(e.pointerId)
  }, [])

  const onPointerMove = useCallback(
    (e: ReactPointerEvent<HTMLElement>) => {
      if (!e.currentTarget.hasPointerCapture(e.pointerId)) return
      const origin = getOrigin()
      onResize(Math.max(min.width, e.clientX - origin.x), Math.max(min.height, e.clientY - origin.y))
    },
    [getOrigin, min.width, min.height, onResize],
  )

  const onPointerUp = useCallback((e: ReactPointerEvent<HTMLElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId)
  }, [])

  return { onPointerDown, onPointerMove, onPointerUp, onPointerCancel: onPointerUp }
}
