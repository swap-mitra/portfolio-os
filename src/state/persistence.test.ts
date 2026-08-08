import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  clearPersistedState,
  hydrateInitialState,
  loadMusicState,
  saveMusicState,
  saveMusicStateNow,
} from './persistence'
import { initialState } from './osReducer'
import type { MusicState } from '../types/os'

const KEY = 'portfolio-os:music:v1'

/** Minimal in-memory Storage stub. Vitest runs in node, so there is no real
    localStorage — which also means these tests cover the "storage missing"
    path for free when the stub is removed. */
function stubStorage(): Map<string, string> {
  const map = new Map<string, string>()
  const store: Storage = {
    get length() {
      return map.size
    },
    clear: () => map.clear(),
    getItem: (k) => map.get(k) ?? null,
    key: (i) => [...map.keys()][i] ?? null,
    removeItem: (k) => void map.delete(k),
    setItem: (k, v) => void map.set(k, v),
  }
  vi.stubGlobal('localStorage', store)
  return map
}

const music: MusicState = {
  videoId: 'dQw4w9WgXcQ',
  isDefaultTrack: false,
  isPlaying: true,
  isMuted: false,
  volume: 42,
  awaitingUserGesture: false,
  lastError: 'stale error',
}

let map: Map<string, string>

beforeEach(() => {
  map = stubStorage()
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

describe('round trip', () => {
  it('persists only the four preference fields', () => {
    saveMusicStateNow(music)
    expect(JSON.parse(map.get(KEY)!)).toEqual({
      videoId: 'dQw4w9WgXcQ',
      isDefaultTrack: false,
      volume: 42,
      isMuted: false,
    })
  })

  it('reads back what it wrote', () => {
    saveMusicStateNow(music)
    expect(loadMusicState()).toEqual({
      videoId: 'dQw4w9WgXcQ',
      isDefaultTrack: false,
      volume: 42,
      isMuted: false,
    })
  })

  it('clears stored preferences', () => {
    saveMusicStateNow(music)
    clearPersistedState()
    expect(loadMusicState()).toEqual({})
  })
})

describe('hydration merges rather than replaces', () => {
  it('a fresh visitor gets untouched defaults', () => {
    expect(hydrateInitialState()).toEqual(initialState)
  })

  it('a returning visitor gets their track and volume back', () => {
    saveMusicStateNow(music)
    const s = hydrateInitialState()
    expect(s.music).toMatchObject({ videoId: 'dQw4w9WgXcQ', volume: 42, isDefaultTrack: false })
  })

  it('never restores playback state — autoplay policy applies every load', () => {
    saveMusicStateNow(music)
    const s = hydrateInitialState()
    expect(s.music).toMatchObject({
      isPlaying: false,
      awaitingUserGesture: true,
      lastError: null,
    })
  })

  it('leaves window layout alone: a returning visitor sees a clean desktop', () => {
    saveMusicStateNow(music)
    const s = hydrateInitialState()
    expect(s.windows).toEqual({})
    expect(s.focusedWindowId).toBeNull()
  })

  it('fills in fields a stored blob predates', () => {
    // Blob written before `isMuted` existed: it must still get its default.
    map.set(KEY, JSON.stringify({ videoId: 'dQw4w9WgXcQ', volume: 10 }))
    const s = hydrateInitialState()
    expect(s.music.volume).toBe(10)
    expect(s.music.isMuted).toBe(initialState.music.isMuted)
  })
})

describe('stale or hostile stored data cannot break a load', () => {
  const survives = (stored: string) => {
    map.set(KEY, stored)
    expect(() => hydrateInitialState()).not.toThrow()
    return hydrateInitialState()
  }

  it('missing key', () => {
    expect(loadMusicState()).toEqual({})
  })

  it('malformed JSON', () => {
    expect(survives('{not json')).toEqual(initialState)
  })

  it('JSON that is not an object', () => {
    expect(survives('"a string"')).toEqual(initialState)
    expect(survives('42')).toEqual(initialState)
    expect(survives('null')).toEqual(initialState)
    expect(survives('[1,2,3]')).toEqual(initialState)
  })

  it('wrong field types are discarded individually', () => {
    map.set(
      KEY,
      JSON.stringify({ videoId: 12345, isDefaultTrack: 'yes', volume: '80', isMuted: 1 }),
    )
    expect(loadMusicState()).toEqual({})
  })

  it('one bad field does not discard the good ones', () => {
    map.set(KEY, JSON.stringify({ videoId: 'not-a-valid-id', volume: 33 }))
    expect(loadMusicState()).toEqual({ volume: 33 })
  })

  it('out-of-range and non-finite volumes are rejected', () => {
    for (const volume of [-1, 101, Number.NaN, Number.POSITIVE_INFINITY]) {
      map.set(KEY, JSON.stringify({ volume }))
      expect(loadMusicState().volume).toBeUndefined()
    }
  })

  it('a video ID of the wrong shape is rejected before it reaches the player', () => {
    for (const videoId of ['', 'short', 'way-too-long-for-youtube', 'has space!!']) {
      map.set(KEY, JSON.stringify({ videoId }))
      expect(loadMusicState().videoId).toBeUndefined()
    }
  })

  it('accepts a valid ID containing the awkward characters', () => {
    map.set(KEY, JSON.stringify({ videoId: '_-aA09zZbY9' }))
    expect(loadMusicState().videoId).toBe('_-aA09zZbY9')
  })
})

describe('when storage is unavailable', () => {
  it('reads and writes are no-ops rather than crashes', () => {
    vi.unstubAllGlobals() // node: no localStorage at all
    expect(loadMusicState()).toEqual({})
    expect(() => saveMusicStateNow(music)).not.toThrow()
    expect(hydrateInitialState()).toEqual(initialState)
  })

  it('a throwing localStorage is treated as absent', () => {
    vi.stubGlobal('localStorage', {
      getItem: () => {
        throw new Error('SecurityError')
      },
      setItem: () => {
        throw new Error('QuotaExceededError')
      },
      removeItem: () => {
        throw new Error('SecurityError')
      },
    })
    expect(loadMusicState()).toEqual({})
    expect(() => saveMusicStateNow(music)).not.toThrow()
    expect(() => clearPersistedState()).not.toThrow()
  })
})

describe('debounced save', () => {
  it('collapses a burst of changes into one write', () => {
    vi.useFakeTimers()
    for (let volume = 0; volume <= 60; volume += 10) saveMusicState({ ...music, volume })
    expect(map.get(KEY)).toBeUndefined()

    vi.advanceTimersByTime(300)
    expect(JSON.parse(map.get(KEY)!).volume).toBe(60)
  })
})
