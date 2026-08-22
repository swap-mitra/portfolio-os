/* The mobile breakpoint (project-spec.md FR11, SPIKE-30).

   Below it, a floating window is the wrong shape: there is no room to put one
   beside anything else, and dragging or resizing by thumb is not a thing
   anybody wants to do. Apps go fullscreen instead, one at a time. */

import { useMediaQuery } from './useMediaQuery'

/** Kept in sync with the same number in responsive.css by hand. The two have
    to agree: this hook decides which handlers are attached, that file decides
    what it looks like, and a disagreement means a window that looks fullscreen
    but still drags. */
export const MOBILE_MAX_WIDTH = 768

export function useIsMobile(): boolean {
  return useMediaQuery(`(max-width: ${MOBILE_MAX_WIDTH}px)`)
}
