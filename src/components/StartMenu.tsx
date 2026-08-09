/* Start Menu: Programs (the apps), Documents (Resume), Shut Down
   (project-spec.md FR7, SPIKE-11). Closes on outside-click or Escape. */

import { useEffect, useRef } from 'react'
import './StartMenu.css'
import { useOS } from '../state/osContext'
import { APP_LABELS } from './Window'
import type { AppType } from '../types/os'

const PROGRAM_APPS: AppType[] = ['about', 'projects', 'contact', 'terminal']

export function StartMenu() {
  const { state, dispatch } = useOS()
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!state.startMenuOpen) return

    const onPointerDown = (e: PointerEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) {
        dispatch({ type: 'CLOSE_START_MENU' })
      }
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dispatch({ type: 'CLOSE_START_MENU' })
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [state.startMenuOpen, dispatch])

  if (!state.startMenuOpen) return null

  const openApp = (appType: AppType) => dispatch({ type: 'OPEN_WINDOW', appType })

  return (
    <div className="start-menu pixel" ref={menuRef}>
      <div className="start-menu-heading">PROGRAMS</div>
      {PROGRAM_APPS.map((appType) => (
        <button key={appType} onClick={() => openApp(appType)}>
          ▸ {APP_LABELS[appType]}
        </button>
      ))}
      <div className="start-menu-heading">DOCUMENTS</div>
      <button onClick={() => openApp('resume')}>▸ {APP_LABELS.resume}</button>
      <button onClick={() => dispatch({ type: 'SET_SHUTDOWN', shuttingDown: true })}>
        ▸ SHUT DOWN…
      </button>
    </div>
  )
}
