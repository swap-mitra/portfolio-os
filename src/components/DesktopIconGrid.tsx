/* Maps the five apps onto DesktopIcon (SPIKE-10). APP_ORDER is a local
   placeholder for the real icon list, same call as APP_LABELS in Window.tsx —
   both move to siteConfig.ts in Phase 6. */

import './DesktopIconGrid.css'
import { useOS } from '../state/osContext'
import { DesktopIcon } from './DesktopIcon'
import { APP_LABELS } from './Window'
import type { AppType } from '../types/os'

const APP_ORDER: AppType[] = ['about', 'projects', 'resume', 'contact', 'terminal']

export function DesktopIconGrid() {
  const { state, dispatch } = useOS()

  return (
    <div className="icon-grid">
      {APP_ORDER.map((appType) => (
        <DesktopIcon
          key={appType}
          appType={appType}
          label={APP_LABELS[appType]}
          selected={state.selectedIconId === appType}
          onSelect={() => dispatch({ type: 'SELECT_ICON', appType })}
          onOpen={() => dispatch({ type: 'OPEN_WINDOW', appType })}
        />
      ))}
    </div>
  )
}
