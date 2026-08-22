/* Start button + one tab per open window + live clock (SPIKE-09, SPIKE-12).
   Tab order follows insertion order (osReducer.ts §3 note), not z-index, so
   tabs don't reshuffle as focus changes. */

import './Taskbar.css'
import { useOS } from '../state/osContext'
import { useClock } from '../hooks/useClock'
import { APP_LABELS } from './Window'
import { START_BUTTON_ID, taskbarTabId } from './focusIds'

export function Taskbar() {
  const { state, dispatch } = useOS()
  const clock = useClock()

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
      <div className="clock pixel">{clock}</div>
    </div>
  )
}
