/* Ids for the controls a window hands focus back to (SPIKE-28).

   A window's close and minimize buttons live inside the window, so
   dispatching from them deletes the focused element and drops focus to
   <body>. The handlers move focus first and dispatch second; these helpers
   keep the id strings from drifting apart across the files at either end. */

import type { AppType } from '../types/os'

export const iconId = (appType: AppType) => `icon-${appType}`
export const taskbarTabId = (windowId: string) => `tab-${windowId}`
export const START_BUTTON_ID = 'start-button'

/** Focus the element with this id, if it's there. A missing target is not an
    error: it just means focus stays where it already is. */
export function focusById(id: string): void {
  document.getElementById(id)?.focus()
}
