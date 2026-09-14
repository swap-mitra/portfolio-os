/* The wordmark bouncing around a black screen after the visitor has done
   nothing for a while, the way a monitor did before "screen off" existed
   (architecture.md §14's nostalgic easter egg, in the retro spirit of the
   shutdown joke). Any input wakes it.

   Always mounted, renders nothing until idle, so Desktop doesn't need to
   know the timeout. The event that wakes it is swallowed in the capture
   phase: an Escape pressed to get the desktop back must not also close the
   window the visitor was reading. useIdle listens in the capture phase on
   the same node, so it still sees the event and ends the idle state. */

import { useEffect } from 'react'
import './Screensaver.css'
import { useIdle } from '../hooks/useIdle'
import { ScanlineOverlay } from './background/ScanlineOverlay'

/** Two minutes: long enough to read the longest window without moving the
    mouse, short enough that a curious visitor who leaves the tab open sees
    it at all. */
const IDLE_MS = 120_000

const WAKE_EVENTS = ['keydown', 'pointerdown', 'click'] as const

export function Screensaver() {
  const idle = useIdle(IDLE_MS)

  useEffect(() => {
    if (!idle) return
    const swallow = (e: Event) => e.stopPropagation()
    for (const type of WAKE_EVENTS) window.addEventListener(type, swallow, { capture: true })
    return () => {
      for (const type of WAKE_EVENTS) window.removeEventListener(type, swallow, { capture: true })
    }
  }, [idle])

  if (!idle) return null

  return (
    /* Decorative takeover: it moves no focus and nothing in it is
       interactive, so a screen reader is better off not knowing. */
    <div className="screensaver" aria-hidden="true">
      <ScanlineOverlay />
      <div className="screensaver-x">
        <div className="screensaver-y">
          <div className="screensaver-logo pixel">PORTFOLIO-OS</div>
          <div className="screensaver-hint">press any key</div>
        </div>
      </div>
    </div>
  )
}
