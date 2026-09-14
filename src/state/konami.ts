/* The Konami code, tracked one key at a time. Pure so the matching is
   testable without a keyboard.

   After each key the progress is the longest tail of what has been typed
   that is also a head of the code, so Up Up Up Down Down still works: the
   third Up is treated as the second, not as a mistake. Ten elements, so the
   brute-force scan costs nothing. */

export const KONAMI = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'b',
  'a',
] as const

/** Progress through the code after `key`, given progress so far. Equals
    `KONAMI.length` on completion; the caller resets to 0. */
export function konamiProgress(progress: number, key: string): number {
  const pressed = key.length === 1 ? key.toLowerCase() : key
  const typed = [...KONAMI.slice(0, progress), pressed]
  for (let len = Math.min(typed.length, KONAMI.length); len > 0; len--) {
    const tail = typed.slice(typed.length - len)
    if (tail.every((k, i) => k === KONAMI[i])) return len
  }
  return 0
}
