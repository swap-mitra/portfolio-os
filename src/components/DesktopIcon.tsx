/* One desktop icon: click selects and opens, Enter/Space when focused opens
   (project-spec.md FR2, SPIKE-10). */

import { PixelIcon } from './icons/PixelIcon'
import { iconId } from './focusIds'
import type { AppType } from '../types/os'

export function DesktopIcon({
  appType,
  label,
  blurb,
  selected,
  onSelect,
  onOpen,
}: {
  appType: AppType
  label: string
  blurb: string
  selected: boolean
  onSelect: () => void
  onOpen: () => void
}) {
  return (
    <div
      id={iconId(appType)}
      className={`icon${selected ? ' selected' : ''}`}
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      aria-describedby={`${iconId(appType)}-tip`}
      onClick={() => {
        onSelect()
        onOpen()
      }}
      onKeyDown={(e) => {
        if (e.key !== 'Enter' && e.key !== ' ') return
        e.preventDefault()
        onSelect()
        onOpen()
      }}
    >
      <PixelIcon variant={appType} />
      <span className="icon-label">{label}</span>
      {/* Hover and focus reveal it after a delay, in CSS (DesktopIconGrid.css). */}
      <span className="icon-tip" role="tooltip" id={`${iconId(appType)}-tip`}>
        {blurb}
      </span>
    </div>
  )
}
