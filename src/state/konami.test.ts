import { describe, expect, it } from 'vitest'
import { KONAMI, konamiProgress } from './konami'

const type = (keys: readonly string[], from = 0) =>
  keys.reduce((progress, key) => konamiProgress(progress, key), from)

describe('konamiProgress', () => {
  it('completes on the exact sequence', () => {
    expect(type(KONAMI)).toBe(KONAMI.length)
  })

  it('accepts B and A in either case', () => {
    expect(type([...KONAMI.slice(0, 8), 'B', 'A'])).toBe(KONAMI.length)
  })

  it('restarts on a wrong key, but a wrong key that starts the code counts', () => {
    expect(konamiProgress(3, 'x')).toBe(0)
    expect(konamiProgress(3, 'ArrowUp')).toBe(1)
  })

  it('treats a third Up as the second, so Up Up Up Down Down still works', () => {
    expect(type(['ArrowUp', 'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown'])).toBe(4)
  })

  it('does nothing for keys typed while idle', () => {
    expect(type(['a', 'b', 'Enter', 'Escape'])).toBe(0)
  })
})
