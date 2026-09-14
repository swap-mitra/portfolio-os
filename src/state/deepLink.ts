/* URL hash <-> app, so `/#projects` opens PROJECTS on load and the hash
   follows whichever window is focused. Pure so the parsing is testable; the
   hash is untrusted input, so anything that is not exactly an app name is
   ignored rather than opened. */

import type { AppType } from '../types/os'

const APPS = new Set<AppType>([
  'about',
  'projects',
  'experience',
  'resume',
  'contact',
  'terminal',
  'recyclebin',
  'minesweeper',
  'jokes',
])

/** The app a hash names, or null. Accepts `#Projects` and `#projects` alike,
    because a hand-typed link will have whatever case the typist used. */
export function appFromHash(hash: string): AppType | null {
  const name = hash.replace(/^#/, '').toLowerCase()
  return APPS.has(name as AppType) ? (name as AppType) : null
}

/** What the address bar should show for the focused window: its app name as
    the hash, or no hash at all for an empty desktop. */
export const hashForApp = (appType: AppType | null): string =>
  appType === null ? '' : `#${appType}`
