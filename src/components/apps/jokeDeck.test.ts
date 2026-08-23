import { describe, expect, it } from 'vitest'
import { shuffle } from './jokeDeck'

/** Walks a fixed list of [0,1) values, so a shuffle is fully determined. */
const rolls = (...values: number[]) => {
  let i = 0
  return () => values[i++ % values.length] ?? 0
}

describe('shuffle', () => {
  it('keeps every item exactly once', () => {
    const items = [1, 2, 3, 4, 5, 6, 7, 8]
    const deck = shuffle(items, Math.random)
    expect([...deck].sort((a, b) => a - b)).toEqual(items)
  })

  it('leaves the input alone', () => {
    const items = [1, 2, 3, 4, 5]
    shuffle(items, Math.random)
    expect(items).toEqual([1, 2, 3, 4, 5])
  })

  it('always picks the last remaining slot when the rolls say so', () => {
    // random() === 0 sends every swap to index 0, which rotates the deck
    // rather than leaving it untouched. Pinned so a "fix" to the loop bounds
    // that quietly stops shuffling gets caught.
    expect(shuffle([1, 2, 3, 4], rolls(0))).toEqual([2, 3, 4, 1])
  })

  it('handles the empty and single-item cases', () => {
    expect(shuffle([], Math.random)).toEqual([])
    expect(shuffle(['only'], Math.random)).toEqual(['only'])
  })

  it('reaches orders a biased sort would not', () => {
    /* The real property: over many shuffles every item lands in every
       position. A biased shuffle leaves holes in this table. */
    const seen = [new Set<number>(), new Set<number>(), new Set<number>(), new Set<number>()]
    for (let run = 0; run < 400; run += 1) {
      const deck = shuffle([0, 1, 2, 3], Math.random)
      deck.forEach((value, position) => seen[position]?.add(value))
    }
    for (const positions of seen) expect(positions.size).toBe(4)
  })
})
