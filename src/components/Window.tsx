/* A single OS window: title bar (drag + controls), body, resize handle.
   Drag/resize mechanics are SPIKE-06/07; bring-to-front-on-any-interaction is
   SPIKE-08; the three title-bar buttons are SPIKE-09. */

import './Window.css'
import { useEffect, useRef } from 'react'
import { useOS } from '../state/osContext'
import { focusById, iconId, taskbarTabId } from './focusIds'
import { currentViewport } from './viewport'
import { useDraggable } from '../hooks/useDraggable'
import { useResizable } from '../hooks/useResizable'
import { MIN_HEIGHT, MIN_WIDTH } from '../state/osReducer'
import type { ReactNode } from 'react'
import type { AppType, WindowState } from '../types/os'
import { AboutApp } from './apps/AboutApp'
import { ProjectsApp } from './apps/ProjectsApp'
import { ContactApp } from './apps/ContactApp'
import { ResumeApp } from './apps/ResumeApp'
import { TerminalApp } from './apps/TerminalApp'

/* Placeholder labels until siteConfig.ts (Phase 6) supplies real copy —
   reused by Taskbar so tab and title-bar text never drift apart. A separate
   file for one small record isn't worth it (see osContext.tsx for the same
   call on the same rule). */
// oxlint-disable-next-line react/only-export-components
export const APP_LABELS: Record<AppType, string> = {
  about: 'ABOUT_ME.TXT',
  projects: 'PROJECTS',
  resume: 'RESUME.PDF',
  contact: 'CONTACT.EXE',
  terminal: 'TERMINAL.EXE',
}

/* Elements rather than component references because none of them take props,
   and only one window per app is ever open. Every app exists as of SPIKE-27,
   so this is a full Record and no longer Partial: a sixth AppType now fails
   to compile here instead of quietly opening an empty window. */
const APP_BODIES: Record<AppType, ReactNode> = {
  about: <AboutApp />,
  projects: <ProjectsApp />,
  contact: <ContactApp />,
  resume: <ResumeApp />,
  terminal: <TerminalApp />,
}

export function Window({ window: win }: { window: WindowState }) {
  const { dispatch } = useOS()
  const windowRef = useRef<HTMLDivElement>(null)

  const focus = () => dispatch({ type: 'FOCUS_WINDOW', id: win.id })

  /* A window that just opened takes focus, so Tab continues into it rather
     than on through the icon grid (SPIKE-28). Guarded because an app may
     have focused something inside itself already: the terminal focuses its
     prompt, and child effects run before this one. */
  useEffect(() => {
    const el = windowRef.current
    if (el !== null && !el.contains(document.activeElement)) el.focus()
  }, [])

  /* Both of these buttons delete the element they were clicked on, and a
     removed focused element drops focus to <body>. Moving focus first and
     dispatching second means there is never a frame with nothing focused. */
  const close = () => {
    focusById(iconId(win.appType))
    dispatch({ type: 'CLOSE_WINDOW', id: win.id })
  }

  const minimize = () => {
    // The tab is where the window went, so it's where focus should follow.
    focusById(taskbarTabId(win.id))
    dispatch({ type: 'MINIMIZE_WINDOW', id: win.id })
  }

  const drag = useDraggable(
    (x, y) => dispatch({ type: 'MOVE_WINDOW', id: win.id, x, y }),
    () => win,
  )
  const resize = useResizable(
    (width, height) => dispatch({ type: 'RESIZE_WINDOW', id: win.id, width, height }),
    () => win,
    { width: MIN_WIDTH, height: MIN_HEIGHT },
  )

  if (win.minimized) return null

  return (
    <div
      ref={windowRef}
      className="window"
      /* Focusable but not tab-reachable: focus is moved here deliberately
         when the window opens, and Tab should walk the controls inside it. */
      tabIndex={-1}
      style={{ left: win.x, top: win.y, width: win.width, height: win.height, zIndex: win.zIndex }}
      onPointerDown={focus}
    >
      <div className="window-titlebar pixel" {...drag}>
        <span>{APP_LABELS[win.appType]}</span>
        <div className="window-btns">
          <button aria-label="minimize" onClick={minimize}>
            _
          </button>
          <button
            aria-label="maximize"
            onClick={() =>
              dispatch({ type: 'TOGGLE_MAXIMIZE', id: win.id, viewport: currentViewport() })
            }
          >
            &#9633;
          </button>
          <button aria-label="close" onClick={close}>
            X
          </button>
        </div>
      </div>
      <div className="window-body">{APP_BODIES[win.appType]}</div>
      {/* Ported from the mockup's #resize-handle, which never made it across
          in SPIKE-07: without the glyph this is an invisible 14px square and
          the window reads as un-resizable. */}
      <div
        className="resize-handle"
        aria-hidden="true"
        onPointerDown={(e) => {
          focus()
          resize.onPointerDown(e)
        }}
        onPointerMove={resize.onPointerMove}
        onPointerUp={resize.onPointerUp}
        onPointerCancel={resize.onPointerCancel}
      >
        <svg viewBox="0 0 10 10" shapeRendering="crispEdges">
          <rect x="7" y="1" width="2" height="2" fill="var(--cyan)" />
          <rect x="4" y="4" width="2" height="2" fill="var(--cyan)" />
          <rect x="7" y="4" width="2" height="2" fill="var(--cyan)" />
          <rect x="1" y="7" width="2" height="2" fill="var(--cyan)" />
          <rect x="4" y="7" width="2" height="2" fill="var(--cyan)" />
          <rect x="7" y="7" width="2" height="2" fill="var(--cyan)" />
        </svg>
      </div>
    </div>
  )
}
