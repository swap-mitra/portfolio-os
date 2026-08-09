/* One desktop icon: click selects and opens, Enter/Space when focused opens
   (project-spec.md FR2, SPIKE-10). */

import { PixelIcon } from './icons/PixelIcon'
import type { AppType } from '../types/os'

export function DesktopIcon({
  appType,
  label,
  selected,
  onSelect,
  onOpen,
}: {
  appType: AppType
  label: string
  selected: boolean
  onSelect: () => void
  onOpen: () => void
}) {
  return (
    <div
      className={`icon${selected ? ' selected' : ''}`}
      role="button"
      tabIndex={0}
      aria-pressed={selected}
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
      <span>{label}</span>
    </div>
  )
}
