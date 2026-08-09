/* The real desktop shell (architecture.md §2), replacing the Phase 2 debug
   harness in App.tsx. Live background/starfield/scanlines (Phase 4) and the
   music widget (Phase 5) aren't built yet, so they aren't mounted here. */

import './Desktop.css'
import { useOS } from '../state/osContext'
import { DesktopIconGrid } from './DesktopIconGrid'
import { WindowManager } from './WindowManager'
import { StartMenu } from './StartMenu'
import { Taskbar } from './Taskbar'

export function Desktop() {
  const { state, dispatch } = useOS()

  return (
    <div
      className="desktop"
      onClick={(e) => {
        if (!(e.target as HTMLElement).closest('.icon')) {
          dispatch({ type: 'SELECT_ICON', appType: null })
        }
      }}
    >
      <div className="wordmark pixel">PORTFOLIO-OS</div>
      <DesktopIconGrid />
      <WindowManager />
      <StartMenu />
      <Taskbar />
      {state.shuttingDown && (
        <div
          className="shutdown-overlay"
          onClick={(e) => {
            e.stopPropagation()
            dispatch({ type: 'SET_SHUTDOWN', shuttingDown: false })
          }}
        >
          <p className="pixel">IT&apos;S NOW SAFE TO TURN OFF YOUR COMPUTER.</p>
          <p className="shutdown-hint">(not really — click anywhere to boot back up)</p>
        </div>
      )}
    </div>
  )
}
