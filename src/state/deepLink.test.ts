import { describe, expect, it } from 'vitest'
import { appFromHash, hashForApp } from './deepLink'

describe('appFromHash', () => {
  it('maps a known app name, with or without the hash, in any case', () => {
    expect(appFromHash('#projects')).toBe('projects')
    expect(appFromHash('projects')).toBe('projects')
    expect(appFromHash('#Experience')).toBe('experience')
  })

  it('ignores anything that is not exactly an app name', () => {
    for (const hash of ['', '#', '#nope', '#projects/1', '#__proto__', '#constructor']) {
      expect(appFromHash(hash)).toBeNull()
    }
  })

  it('round-trips through hashForApp', () => {
    expect(appFromHash(hashForApp('terminal'))).toBe('terminal')
    expect(hashForApp(null)).toBe('')
  })
})
