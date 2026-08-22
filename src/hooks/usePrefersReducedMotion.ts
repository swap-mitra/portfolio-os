/* Reads the OS "reduce motion" setting (SPIKE-17). The decorative background
   handles reduced motion in CSS media queries instead, which is cheaper and
   applies before React mounts. This hook is for the cases where JavaScript
   has to branch, like skipping an animated sequence outright. */

import { useMediaQuery } from './useMediaQuery'

export function usePrefersReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)')
}
