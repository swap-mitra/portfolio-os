/* The live viewport, for the actions that have to size or place a window
   against it (open and maximize).

   Read at dispatch time rather than held in state: it is only ever needed at
   the instant of the action, and a stored copy would be one more thing that
   can go stale behind a resize. */

import type { Viewport } from '../state/osReducer'

export const currentViewport = (): Viewport => ({
  width: window.innerWidth,
  height: window.innerHeight,
})
