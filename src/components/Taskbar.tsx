/* Start button + one tab per open window + live clock (SPIKE-09, SPIKE-12).
   Tab order follows insertion order (osReducer.ts §3 note), not z-index, so
   tabs don't reshuffle as focus changes. */

import { useEffect, useState } from 'react'
import './Taskbar.css'
import { useOS } from '../state/osContext'
import { useClock } from '../hooks/useClock'
import { APP_LABELS } from './Window'
import { START_BUTTON_ID, taskbarTabId } from './focusIds'

/** How long the drive light stays lit after something "hits the disk". */
const LED_MS = 500

export function Taskbar() {
  const { state, dispatch } = useOS()
  const clock = useClock()

  /* A drive light with nothing to read: it lights when a window opens or
     closes and when a track loads, and once on mount, like the seek a real
     machine did at startup. Derived from state the taskbar already has,
     rather than a new action for a decoration. */
  const windowCount = Object.keys(state.windows).length
  const [busy, setBusy] = useState(false)
  useEffect(() => {
    setBusy(true)
    const id = setTimeout(() => setBusy(false), LED_MS)
    return () => clearTimeout(id)
  }, [windowCount, state.music.videoId])

  return (
    <div className="taskbar">
      <button
        id={START_BUTTON_ID}
        className="start-btn pixel"
        aria-expanded={state.startMenuOpen}
        onClick={() => dispatch({ type: 'TOGGLE_START_MENU' })}
      >
        ▸ START
      </button>
      {Object.values(state.windows).map((w) => (
        <button
          key={w.id}
          id={taskbarTabId(w.id)}
          className={`taskbar-tab pixel${w.id === state.focusedWindowId ? ' active' : ''}`}
          onClick={() => dispatch({ type: 'RESTORE_WINDOW', id: w.id })}
        >
          {APP_LABELS[w.appType]}
        </button>
      ))}
      <span className={busy ? 'disk-led busy' : 'disk-led'} aria-hidden="true" />
      <div className="clock pixel">{clock}</div>
    </div>
  )
}
