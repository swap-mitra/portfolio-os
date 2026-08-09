/* Live taskbar clock (architecture.md §2, SPIKE-12). */

import { useEffect, useState } from 'react'

/** Pure so it's testable without a timer or a DOM. */
export function formatClock(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

/** Ticks once a second, formatted HH:MM:SS to match the mockup's #clock. */
export function useClock(): string {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  return formatClock(now)
}
