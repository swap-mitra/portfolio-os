/* Maps the five apps onto DesktopIcon (SPIKE-10). APP_ORDER is a local
   placeholder for the real icon list, same call as APP_LABELS in Window.tsx —
   both move to siteConfig.ts in Phase 6. */

import './DesktopIconGrid.css'
import { useOS } from '../state/osContext'
import { DesktopIcon } from './DesktopIcon'
import { APP_LABELS } from './Window'
import { currentViewport } from './viewport'
import type { AppType } from '../types/os'

const APP_ORDER: AppType[] = [
  'about',
  'projects',
  'experience',
  'resume',
  'contact',
  'terminal',
  'recyclebin',
  'minesweeper',
  'jokes',
]

/** One line per icon, shown as a help balloon after a second's hover. */
const APP_BLURBS: Record<AppType, string> = {
  about: 'Who I am and what I do',
  projects: 'Things I have built, with links',
  experience: 'Where I have worked',
  resume: 'The one-page PDF, preview and download',
  contact: 'Email, GitHub, LinkedIn',
  terminal: "Type 'help' and see",
  recyclebin: 'Projects I no longer maintain',
  minesweeper: 'It is exactly what you think',
  jokes: 'One joke at a time',
}

export function DesktopIconGrid() {
  const { state, dispatch } = useOS()

  return (
    <div className="icon-grid">
      {APP_ORDER.map((appType) => (
        <DesktopIcon
          key={appType}
          appType={appType}
          label={APP_LABELS[appType]}
          blurb={APP_BLURBS[appType]}
          selected={state.selectedIconId === appType}
          onSelect={() => dispatch({ type: 'SELECT_ICON', appType })}
          onOpen={() => dispatch({ type: 'OPEN_WINDOW', appType, viewport: currentViewport() })}
        />
      ))}
    </div>
  )
}
