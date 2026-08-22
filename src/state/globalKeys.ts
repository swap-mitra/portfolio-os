/* Desktop-wide key handling (project-spec.md §9, SPIKE-28).

   Pure and separate from Desktop so the precedence is testable without a DOM.
   With the Start Menu open, Escape has to close the menu and leave the
   focused window alone, which is exactly the sort of rule that quietly
   inverts itself the next time someone adds a listener. */

import type { OSState } from '../types/os'
import type { Action } from './osReducer'

/** Keys that don't count as "any key". Holding Shift to walk backwards out of
    something shouldn't count as dismissing the shutdown screen. */
const MODIFIERS = new Set(['Shift', 'Control', 'Alt', 'Meta'])

/** What a key press means to the desktop as a whole, or null to leave it to
    whatever is focused. */
export function globalKeyAction(key: string, state: OSState): Action | null {
  /* The shutdown overlay is a full-page takeover with nothing focusable in
     it, so any key has to get back out of it. Same contract as the boot
     screen, which is where a visitor last saw it. */
  if (state.shuttingDown) {
    return MODIFIERS.has(key) ? null : { type: 'SET_SHUTDOWN', shuttingDown: false }
  }

  if (key !== 'Escape') return null

  if (state.startMenuOpen) return { type: 'CLOSE_START_MENU' }
  /* Never a minimized window: minimizing hands focus to the topmost window
     that is still visible, or to nothing at all. */
  if (state.focusedWindowId !== null) {
    return { type: 'CLOSE_WINDOW', id: state.focusedWindowId }
  }
  return null
}
