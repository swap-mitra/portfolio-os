/* Start Menu: Programs (the apps), Documents (Resume), Shut Down
   (project-spec.md FR7, SPIKE-11). Closes on outside-click or Escape, the
   latter owned by globalKeys.ts since SPIKE-28 gave Escape a second job. */

import { useEffect, useRef } from 'react'
import './StartMenu.css'
import { useOS } from '../state/osContext'
import { APP_LABELS } from './Window'
import { START_BUTTON_ID, focusById } from './focusIds'
import type { AppType } from '../types/os'

const PROGRAM_APPS: AppType[] = ['about', 'projects', 'contact', 'terminal']

export function StartMenu() {
  const { state, dispatch } = useOS()
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!state.startMenuOpen) return

    /* Opening from the keyboard has to land focus inside the menu. The menu
       renders before the taskbar, so Tab from the Start button walks away
       from the menu rather than into it. */
    menuRef.current?.querySelector('button')?.focus()

    const onPointerDown = (e: PointerEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) {
        dispatch({ type: 'CLOSE_START_MENU' })
      }
    }

    document.addEventListener('pointerdown', onPointerDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      /* Repairs orphaned focus only: the menu unmounting out from under a
         focused item drops focus to <body>, while a click elsewhere has
         already put focus where the visitor wanted it. Opening an app also
         lands here, and the new window's effect runs after this one and
         takes focus off the Start button again. */
      if (document.activeElement === document.body) focusById(START_BUTTON_ID)
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
