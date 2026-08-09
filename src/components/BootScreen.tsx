/* Plays once on load, then unmounts into the Desktop (SPIKE-13 — built now,
   not deferred: low risk, and the component tree in architecture.md §2
   already names it). Any key/click skips ahead; reduced-motion skips
   straight to the desktop. */

import { useEffect, useState } from 'react'
import './BootScreen.css'

const LINES = [
  'PORTFOLIO-OS v1.0',
  'INITIALIZING NEON SUBSYSTEMS...',
  'LOADING DESKTOP ENVIRONMENT...',
  'READY.',
]

const LINE_DELAY_MS = 400
const HOLD_MS = 900

export function BootScreen({ onDone }: { onDone: () => void }) {
  const [skip] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [visibleLines, setVisibleLines] = useState(0)

  useEffect(() => {
    if (skip) return
    document.addEventListener('keydown', onDone)
    document.addEventListener('pointerdown', onDone)
    return () => {
      document.removeEventListener('keydown', onDone)
      document.removeEventListener('pointerdown', onDone)
    }
  }, [skip, onDone])

  useEffect(() => {
    if (skip) {
      onDone()
      return
    }
    if (visibleLines < LINES.length) {
      const id = setTimeout(() => setVisibleLines((n) => n + 1), LINE_DELAY_MS)
      return () => clearTimeout(id)
    }
    const id = setTimeout(onDone, HOLD_MS)
    return () => clearTimeout(id)
  }, [skip, visibleLines, onDone])

  if (skip) return null

  return (
    <div className="boot-screen pixel">
      {LINES.slice(0, visibleLines).map((line) => (
        <div key={line}>{line}</div>
      ))}
      {visibleLines >= LINES.length && <div className="boot-hint">PRESS ANY KEY TO CONTINUE</div>}
    </div>
  )
}
