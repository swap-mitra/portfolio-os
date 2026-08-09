/* One tab per open window, kept in sync with focus/minimize state (SPIKE-09).
   Tab order follows insertion order (osReducer.ts §3 note), not z-index, so
   tabs don't reshuffle as focus changes. */

import './Taskbar.css'
import { useOS } from '../state/osContext'
import { APP_LABELS } from './Window'

export function Taskbar() {
  const { state, dispatch } = useOS()

  return (
    <div className="taskbar">
      {Object.values(state.windows).map((w) => (
        <button
          key={w.id}
          className={`taskbar-tab pixel${w.id === state.focusedWindowId ? ' active' : ''}`}
          onClick={() => dispatch({ type: 'RESTORE_WINDOW', id: w.id })}
        >
          {APP_LABELS[w.appType]}
        </button>
      ))}
    </div>
  )
}
