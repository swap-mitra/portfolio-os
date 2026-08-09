/* CRT scanlines over the whole desktop, ported from the mockup's #scanlines
   (SPIKE-16). Styles live in crt-effects.css alongside the starfield. */

import { memo } from 'react'
import '../../styles/crt-effects.css'

export const ScanlineOverlay = memo(function ScanlineOverlay() {
  return <div className="scanlines" aria-hidden="true" />
})
