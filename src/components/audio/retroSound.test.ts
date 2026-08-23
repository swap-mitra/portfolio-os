import { describe, expect, it } from 'vitest'
import { playLoss, playWin } from './retroSound'

/* The branch worth pinning: vitest runs in node, where there is no
   AudioContext at all. Both stings have to be no-ops there rather than
   throwing, because the same thing happens in a browser without Web Audio
   and it must not take the game down with it. */
describe('without Web Audio', () => {
  it('plays nothing instead of throwing', () => {
    expect(() => playWin()).not.toThrow()
    expect(() => playLoss()).not.toThrow()
  })
})
