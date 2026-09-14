/* True once the visitor has done nothing for `ms`, false again on the next
   pointer, key, wheel, or touch event. Drives the screensaver.

   One timer, reset per event. pointermove fires a lot, but a clearTimeout
   plus setTimeout per move is cheaper than anything that tries to be clever
   about it. Capture phase, because the screensaver stops the wake event
   propagating and this still has to see it. */

import { useEffect, useState } from 'react'

const ACTIVITY_EVENTS = ['pointermove', 'pointerdown', 'keydown', 'wheel', 'touchstart'] as const

export function useIdle(ms: number): boolean {
  const [idle, setIdle] = useState(false)

  useEffect(() => {
    let timer = setTimeout(() => setIdle(true), ms)
    const reset = () => {
      clearTimeout(timer)
      setIdle(false)
      timer = setTimeout(() => setIdle(true), ms)
    }
    for (const type of ACTIVITY_EVENTS) window.addEventListener(type, reset, { passive: true, capture: true })
    return () => {
      clearTimeout(timer)
      for (const type of ACTIVITY_EVENTS) window.removeEventListener(type, reset, { capture: true })
    }
  }, [ms])

  return idle
}
