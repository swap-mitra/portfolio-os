import { describe, expect, it } from 'vitest'
import { formatClock } from './useClock'

describe('formatClock', () => {
  it('zero-pads hours, minutes, and seconds', () => {
    expect(formatClock(new Date(2026, 0, 1, 3, 5, 9))).toBe('03:05:09')
  })

  it('formats a full two-digit time as-is', () => {
    expect(formatClock(new Date(2026, 0, 1, 23, 59, 45))).toBe('23:59:45')
  })

  it('formats midnight', () => {
    expect(formatClock(new Date(2026, 0, 1, 0, 0, 0))).toBe('00:00:00')
  })
})
