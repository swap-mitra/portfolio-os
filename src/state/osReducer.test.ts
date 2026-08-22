import { describe, expect, it } from 'vitest'
import type { OSState } from '../types/os'
import { MIN_HEIGHT, MIN_WIDTH, OPEN_SIZE, initialState, osReducer } from './osReducer'
import type { Action } from './osReducer'
import type { AppType } from '../types/os'

const viewport = { width: 1280, height: 800 }

/** Every open carries the viewport, so the reducer can size and place the
    window against it. */
const open = (appType: AppType): Action => ({ type: 'OPEN_WINDOW', appType, viewport })

/** Apply a sequence of actions, so tests read as the flow they describe. */
const run = (...actions: Action[]): OSState => actions.reduce(osReducer, initialState)

describe('opening windows', () => {
  it('assigns an incrementing zIndex per window', () => {
    const s = run(
      open('about'),
      open('projects'),
      open('terminal'),
    )
    const zs = ['about', 'projects', 'terminal'].map((id) => s.windows[id]!.zIndex)
    expect(zs).toEqual([...zs].sort((a, b) => a - b))
    expect(new Set(zs).size).toBe(3)
    expect(s.nextZIndex).toBeGreaterThan(Math.max(...zs))
  })

  it('focuses the newly opened window', () => {
    const s = run(open('about'), open('contact'))
    expect(s.focusedWindowId).toBe('contact')
  })

  it('opens at the default size and cascades position so windows do not stack exactly', () => {
    const s = run(open('about'), open('projects'))
    expect(s.windows['about']).toMatchObject(OPEN_SIZE.about)
    expect(s.windows['projects']!.x).not.toBe(s.windows['about']!.x)
    expect(s.windows['projects']!.y).not.toBe(s.windows['about']!.y)
  })

  it('re-opening an already-open app focuses it instead of creating a duplicate', () => {
    const s = run(
      open('about'),
      open('projects'),
      open('about'),
    )
    expect(Object.keys(s.windows)).toHaveLength(2)
    expect(s.focusedWindowId).toBe('about')
    expect(s.windows['about']!.zIndex).toBeGreaterThan(s.windows['projects']!.zIndex)
  })

  it('re-opening a minimized app un-minimizes it', () => {
    const s = run(
      open('about'),
      { type: 'MINIMIZE_WINDOW', id: 'about' },
      open('about'),
    )
    expect(s.windows['about']!.minimized).toBe(false)
    expect(s.focusedWindowId).toBe('about')
  })

  it('closes the start menu, since apps are also launched from it', () => {
    const s = run({ type: 'TOGGLE_START_MENU' }, open('resume'))
    expect(s.startMenuOpen).toBe(false)
  })
})

describe('focus / z-index stacking', () => {
  it('focusing a background window brings it to front', () => {
    const s = run(
      open('about'),
      open('projects'),
      open('terminal'),
      { type: 'FOCUS_WINDOW', id: 'about' },
    )
    expect(s.focusedWindowId).toBe('about')
    const top = Object.values(s.windows).reduce((a, b) => (b.zIndex > a.zIndex ? b : a))
    expect(top.id).toBe('about')
  })

  it('re-focusing the already-focused window is a no-op, so the counter does not creep', () => {
    const opened = run(open('about'))
    const again = osReducer(osReducer(opened, { type: 'FOCUS_WINDOW', id: 'about' }), {
      type: 'FOCUS_WINDOW',
      id: 'about',
    })
    expect(again).toBe(opened)
    expect(again.nextZIndex).toBe(opened.nextZIndex)
  })

  it('keeps correct relative order after many focus changes', () => {
    // `nextZIndex` grows without bound by design. That is safe only because
    // WindowManager establishes its own stacking context at the --z-windows
    // layer, so these values are compared among windows and never against the
    // scanline/taskbar/start-menu layers (architecture.md §6). Asserting a
    // ceiling here instead would be asserting a bug.
    let s = run(open('about'), open('projects'))
    for (let i = 0; i < 500; i++) {
      s = osReducer(s, { type: 'FOCUS_WINDOW', id: i % 2 === 0 ? 'about' : 'projects' })
    }
    expect(Number.isSafeInteger(s.nextZIndex)).toBe(true)
    const top = Object.values(s.windows).reduce((a, b) => (b.zIndex > a.zIndex ? b : a))
    expect(top.id).toBe(s.focusedWindowId)
  })

  it('ignores focus for an unknown id rather than inventing a window', () => {
    const s = run(open('about'))
    expect(osReducer(s, { type: 'FOCUS_WINDOW', id: 'nope' })).toBe(s)
  })
})

describe('closing windows', () => {
  it('removes the window entirely, so its taskbar tab disappears', () => {
    const s = run(
      open('about'),
      open('projects'),
      { type: 'CLOSE_WINDOW', id: 'about' },
    )
    expect(s.windows['about']).toBeUndefined()
    expect(Object.keys(s.windows)).toEqual(['projects'])
  })

  it('hands focus to the next visible window instead of dropping it', () => {
    const s = run(
      open('about'),
      open('projects'),
      { type: 'CLOSE_WINDOW', id: 'projects' },
    )
    expect(s.focusedWindowId).toBe('about')
  })

  it('focus becomes null when the last window closes', () => {
    const s = run(open('about'), { type: 'CLOSE_WINDOW', id: 'about' })
    expect(s.focusedWindowId).toBeNull()
  })

  it('re-opening a closed app creates a fresh window, not a stale one', () => {
    const s = run(
      open('about'),
      { type: 'MOVE_WINDOW', id: 'about', x: 999, y: 999 },
      { type: 'CLOSE_WINDOW', id: 'about' },
      open('about'),
    )
    expect(s.windows['about']).toMatchObject(OPEN_SIZE.about)
    expect(s.windows['about']!.x).not.toBe(999)
  })
})

describe('minimize / restore', () => {
  it('keeps the window in state so the taskbar tab survives', () => {
    const s = run(open('about'), { type: 'MINIMIZE_WINDOW', id: 'about' })
    expect(s.windows['about']).toBeDefined()
    expect(s.windows['about']!.minimized).toBe(true)
  })

  it('drops focus when the focused window is minimized', () => {
    const s = run(
      open('about'),
      open('projects'),
      { type: 'MINIMIZE_WINDOW', id: 'projects' },
    )
    expect(s.focusedWindowId).toBe('about')
  })

  it('restoring un-minimizes and brings to front', () => {
    const s = run(
      open('about'),
      open('projects'),
      { type: 'MINIMIZE_WINDOW', id: 'about' },
      { type: 'RESTORE_WINDOW', id: 'about' },
    )
    expect(s.windows['about']!.minimized).toBe(false)
    expect(s.focusedWindowId).toBe('about')
    expect(s.windows['about']!.zIndex).toBeGreaterThan(s.windows['projects']!.zIndex)
  })

  it('restores the last minimized window even when it was the focused one', () => {
    // Regression: `focus` short-circuits on the already-focused window, which
    // would otherwise leave a lone minimized window stuck minimized.
    const s = run(
      open('about'),
      { type: 'MINIMIZE_WINDOW', id: 'about' },
      { type: 'RESTORE_WINDOW', id: 'about' },
    )
    expect(s.windows['about']!.minimized).toBe(false)
    expect(s.focusedWindowId).toBe('about')
  })
})

describe('maximize', () => {
  it('stores pre-maximize bounds and expands without going fullscreen', () => {
    const s = run(
      open('about'),
      { type: 'TOGGLE_MAXIMIZE', id: 'about', viewport },
    )
    const opened = run(open('about')).windows['about']!
    const w = s.windows['about']!
    expect(w.maximized).toBe(true)
    // The contract is "whatever it was before", not a particular number.
    expect(w.prevBounds).toEqual({
      x: opened.x,
      y: opened.y,
      width: opened.width,
      height: opened.height,
    })
    expect(w.width).toBeLessThan(viewport.width)
    expect(w.height).toBeLessThan(viewport.height)
  })

  it('toggling again restores the exact previous position and size', () => {
    const s = run(
      open('about'),
      { type: 'MOVE_WINDOW', id: 'about', x: 412, y: 133 },
      { type: 'RESIZE_WINDOW', id: 'about', width: 500, height: 360 },
      { type: 'TOGGLE_MAXIMIZE', id: 'about', viewport },
      { type: 'TOGGLE_MAXIMIZE', id: 'about', viewport },
    )
    expect(s.windows['about']).toMatchObject({
      x: 412,
      y: 133,
      width: 500,
      height: 360,
      maximized: false,
    })
    expect(s.windows['about']!.prevBounds).toBeUndefined()
  })

  it('never shrinks below the minimums on a tiny viewport', () => {
    const s = run(
      open('about'),
      { type: 'TOGGLE_MAXIMIZE', id: 'about', viewport: { width: 200, height: 150 } },
    )
    expect(s.windows['about']!.width).toBe(MIN_WIDTH)
    expect(s.windows['about']!.height).toBe(MIN_HEIGHT)
  })

  it('survives minimize → maximize → restore → close without orphans', () => {
    const s = run(
      open('about'),
      { type: 'MINIMIZE_WINDOW', id: 'about' },
      { type: 'TOGGLE_MAXIMIZE', id: 'about', viewport },
      { type: 'RESTORE_WINDOW', id: 'about' },
      { type: 'TOGGLE_MAXIMIZE', id: 'about', viewport },
      { type: 'CLOSE_WINDOW', id: 'about' },
    )
    expect(s.windows).toEqual({})
    expect(s.focusedWindowId).toBeNull()
  })
})

describe('move / resize', () => {
  it('moving does not change size', () => {
    const s = run(open('about'), { type: 'MOVE_WINDOW', id: 'about', x: 10, y: 20 })
    expect(s.windows['about']).toMatchObject({
      x: 10,
      y: 20,
      ...OPEN_SIZE.about,
    })
  })

  it('clamps to the minimum size', () => {
    const s = run(
      open('about'),
      { type: 'RESIZE_WINDOW', id: 'about', width: 10, height: 10 },
    )
    expect(s.windows['about']).toMatchObject({ width: MIN_WIDTH, height: MIN_HEIGHT })
  })

  it('ignores move/resize for a window that was already closed', () => {
    const s = run(open('about'), { type: 'CLOSE_WINDOW', id: 'about' })
    expect(osReducer(s, { type: 'MOVE_WINDOW', id: 'about', x: 1, y: 1 })).toBe(s)
  })
})

describe('icons, start menu, shutdown', () => {
  it('selects and deselects an icon', () => {
    const selected = run({ type: 'SELECT_ICON', appType: 'terminal' })
    expect(selected.selectedIconId).toBe('terminal')
    expect(osReducer(selected, { type: 'SELECT_ICON', appType: null }).selectedIconId).toBeNull()
  })

  it('toggles the start menu, and closes it idempotently', () => {
    const open = run({ type: 'TOGGLE_START_MENU' })
    expect(open.startMenuOpen).toBe(true)
    const closed = osReducer(open, { type: 'CLOSE_START_MENU' })
    expect(closed.startMenuOpen).toBe(false)
    // Already closed: same object back, so an outside-click handler firing
    // repeatedly can't cause re-renders.
    expect(osReducer(closed, { type: 'CLOSE_START_MENU' })).toBe(closed)
  })

  it('shutting down closes the start menu it was launched from', () => {
    const s = run({ type: 'TOGGLE_START_MENU' }, { type: 'SET_SHUTDOWN', shuttingDown: true })
    expect(s.shuttingDown).toBe(true)
    expect(s.startMenuOpen).toBe(false)
  })
})

describe('music', () => {
  it('loading a visitor track marks it as not the default and clears any error', () => {
    const s = run(
      { type: 'MUSIC_ERROR', message: "Couldn't parse that URL" },
      { type: 'LOAD_TRACK', videoId: 'abc12345678' },
    )
    expect(s.music).toMatchObject({
      videoId: 'abc12345678',
      isDefaultTrack: false,
      isPlaying: true,
      lastError: null,
    })
  })

  it('loading the configured default keeps isDefaultTrack true', () => {
    const s = run({ type: 'LOAD_TRACK', videoId: 'default123', isDefaultTrack: true })
    expect(s.music.isDefaultTrack).toBe(true)
  })

  it('a bad URL does not interrupt what is already playing', () => {
    const s = run(
      { type: 'LOAD_TRACK', videoId: 'playing123' },
      { type: 'MUSIC_ERROR', message: 'nope' },
    )
    expect(s.music).toMatchObject({ videoId: 'playing123', isPlaying: true, lastError: 'nope' })
  })

  it('starts muted and awaiting a gesture, per the autoplay policy', () => {
    expect(initialState.music).toMatchObject({ isMuted: true, awaitingUserGesture: true })
  })

  it('resolving the gesture unmutes exactly once', () => {
    const s = run({ type: 'MUSIC_GESTURE_RESOLVED' })
    expect(s.music).toMatchObject({ isMuted: false, awaitingUserGesture: false, isPlaying: true })
  })

  it('raises a stored volume of 0, since unmuting into silence is not unmuting', () => {
    const s = run({ type: 'SET_VOLUME', volume: 0 }, { type: 'MUSIC_GESTURE_RESOLVED' })
    expect(s.music.volume).toBeGreaterThan(0)
    expect(s.music.isMuted).toBe(false)
  })

  it('leaves an audible stored volume alone', () => {
    const s = run({ type: 'SET_VOLUME', volume: 20 }, { type: 'MUSIC_GESTURE_RESOLVED' })
    expect(s.music.volume).toBe(20)
  })

  it('mute toggles without destroying the volume level', () => {
    const s = run({ type: 'SET_VOLUME', volume: 45 }, { type: 'TOGGLE_MUTE' })
    expect(s.music.volume).toBe(45)
    expect(osReducer(s, { type: 'TOGGLE_MUTE' }).music.volume).toBe(45)
  })

  it('clamps volume to 0-100', () => {
    expect(run({ type: 'SET_VOLUME', volume: 500 }).music.volume).toBe(100)
    expect(run({ type: 'SET_VOLUME', volume: -20 }).music.volume).toBe(0)
  })

  it('raising the volume from muted implicitly unmutes', () => {
    const s = run({ type: 'SET_VOLUME', volume: 60 })
    expect(s.music.isMuted).toBe(false)
  })

  it('sliding to zero leaves the mute flag alone', () => {
    const s = run({ type: 'TOGGLE_MUTE' }, { type: 'SET_VOLUME', volume: 0 })
    expect(s.music.isMuted).toBe(false)
  })

  it('play/pause is independent of the loaded track', () => {
    const s = run({ type: 'LOAD_TRACK', videoId: 'x' }, { type: 'PAUSE_MUSIC' })
    expect(s.music).toMatchObject({ videoId: 'x', isPlaying: false })
    expect(osReducer(s, { type: 'PLAY_MUSIC' }).music.isPlaying).toBe(true)
  })
})

describe('immutability', () => {
  it('never mutates the state it was handed', () => {
    const before = JSON.stringify(initialState)
    run(
      open('about'),
      { type: 'MOVE_WINDOW', id: 'about', x: 5, y: 5 },
      { type: 'TOGGLE_MAXIMIZE', id: 'about', viewport },
      { type: 'CLOSE_WINDOW', id: 'about' },
    )
    expect(JSON.stringify(initialState)).toBe(before)
  })
})
