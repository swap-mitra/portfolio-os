/* The real desktop shell (architecture.md §2), replacing the Phase 2 debug
   harness in App.tsx. */

import { useEffect, useState } from 'react'
import './Desktop.css'
import { useOS } from '../state/osContext'
import { CityscapeBackground } from './background/CityscapeBackground'
import { Starfield } from './background/Starfield'
import { ScanlineOverlay } from './background/ScanlineOverlay'
import { DesktopIconGrid } from './DesktopIconGrid'
import { WindowManager } from './WindowManager'
import { StartMenu } from './StartMenu'
import { Taskbar } from './Taskbar'
import { MusicPlayer } from './audio/MusicPlayer'

/* Nothing on this desktop is worth animating for a tab nobody is looking at
   (SPIKE-17). Owned here rather than inside the background components so one
   listener covers every animation on the desktop, including the ones Phase 3
   added to the taskbar. */
function useDocumentHidden(): boolean {
  const [hidden, setHidden] = useState(() => document.hidden)

  useEffect(() => {
    const onChange = () => setHidden(document.hidden)
    document.addEventListener('visibilitychange', onChange)
    return () => document.removeEventListener('visibilitychange', onChange)
  }, [])

  return hidden
}

export function Desktop() {
  const { state, dispatch } = useOS()
  const hidden = useDocumentHidden()

  return (
    <div
      className={hidden ? 'desktop desktop--paused' : 'desktop'}
      onClick={(e) => {
        if (!(e.target as HTMLElement).closest('.icon')) {
          dispatch({ type: 'SELECT_ICON', appType: null })
        }
      }}
    >
      <CityscapeBackground />
      <Starfield />
      <ScanlineOverlay />
      <div className="wordmark pixel">PORTFOLIO-OS</div>
      <DesktopIconGrid />
      <WindowManager />
      <StartMenu />
      <MusicPlayer />
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
