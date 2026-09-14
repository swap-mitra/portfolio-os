/* The real desktop shell (architecture.md §2), replacing the Phase 2 debug
   harness in App.tsx. */

import { useEffect, useState } from 'react'
import './Desktop.css'
import { useOS } from '../state/osContext'
import { DriveBackground } from './background/DriveBackground'
import { ScanlineOverlay } from './background/ScanlineOverlay'
import { DesktopIconGrid } from './DesktopIconGrid'
import { WindowManager } from './WindowManager'
import { StartMenu } from './StartMenu'
import { Taskbar } from './Taskbar'
import { MusicPlayer } from './audio/MusicPlayer'
import { Screensaver } from './Screensaver'
import { globalKeyAction } from '../state/globalKeys'
import { focusById, iconId } from './focusIds'
import { currentViewport } from './viewport'
import { appFromHash, hashForApp } from '../state/deepLink'

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

  /* `/#projects` opens PROJECTS: a link from a CV or a profile can land on
     the window rather than on an icon somebody has to find. Read once, when
     the desktop mounts after the boot screen. OPEN_WINDOW on an app that is
     already open just focuses it, so StrictMode's double effect is harmless. */
  useEffect(() => {
    const appType = appFromHash(window.location.hash)
    if (appType !== null) dispatch({ type: 'OPEN_WINDOW', appType, viewport: currentViewport() })
  }, [dispatch])

  /* The hash follows focus so the address bar is always a link back to what
     the visitor is looking at. replaceState, not assignment: writing
     location.hash pushes a history entry per focus change, and Back would
     then walk through every window ever clicked. */
  const focused = state.focusedWindowId === null ? null : state.windows[state.focusedWindowId]?.appType ?? null
  useEffect(() => {
    const hash = hashForApp(focused)
    if (window.location.hash === hash) return
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}${hash}`)
  }, [focused])

  /* One keydown listener for the whole desktop, so the precedence between
     "close the menu" and "close the window" lives in globalKeys.ts rather
     than in whichever component happened to add its listener first
     (SPIKE-28). */
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const action = globalKeyAction(e.key, state)
      if (action === null) return
      e.preventDefault()
      // Focus has to leave the window before the window stops existing.
      if (action.type === 'CLOSE_WINDOW') {
        const closing = state.windows[action.id]
        if (closing !== undefined) focusById(iconId(closing.appType))
      }
      dispatch(action)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [state, dispatch])

  return (
    <div
      className={[
        'desktop',
        hidden ? 'desktop--paused' : '',
        state.shuttingDown ? 'desktop--off' : '',
      ].join(' ')}
      onClick={(e) => {
        if (!(e.target as HTMLElement).closest('.icon')) {
          dispatch({ type: 'SELECT_ICON', appType: null })
        }
      }}
    >
      {/* Everything that is "the picture" lives in one box so the CRT
          power-off can collapse it as one image (Desktop.css). The overlays
          below it are what the visitor sees once the tube is dark. */}
      <div className="desktop-screen">
        <DriveBackground />
        <div className="drive-vignette" aria-hidden="true" />
        <ScanlineOverlay />
        <div className="wordmark pixel">PORTFOLIO-OS</div>
        <DesktopIconGrid />
        <WindowManager />
        <StartMenu />
        <MusicPlayer />
        <Taskbar />
      </div>
      <Screensaver />
      {state.shuttingDown && (
        <div
          className="shutdown-overlay"
          /* Nothing in here is focusable, and focus is left behind on the
             Start button, so a screen reader needs telling that the screen
             was taken over. Any key dismisses it (globalKeys.ts). */
          role="alert"
          onClick={(e) => {
            e.stopPropagation()
            dispatch({ type: 'SET_SHUTDOWN', shuttingDown: false })
          }}
        >
          <p className="pixel">IT&apos;S NOW SAFE TO TURN OFF YOUR COMPUTER.</p>
          <p className="shutdown-hint">(not really: press any key or click to boot back up)</p>
        </div>
      )}
    </div>
  )
}
