/* SPIKE-03 sanity check: can OSState actually express every interaction the
   mockup demonstrates? Each block below is a hand-built state snapshot for one
   interaction. The value is mostly in this file compiling under strict mode —
   the runtime assertions just stop it rotting into a type-only file nobody
   notices has gone stale. */

import { describe, expect, it } from 'vitest'
import type { AppType, MusicState, OSState, WindowState } from './os'

const win = (id: string, appType: AppType, over: Partial<WindowState> = {}): WindowState => ({
  id,
  appType,
  x: 250,
  y: 90,
  width: 420,
  height: 330,
  zIndex: 20,
  minimized: false,
  maximized: false,
  ...over,
})

const music: MusicState = {
  videoId: 'dQw4w9WgXcQ',
  isDefaultTrack: true,
  isPlaying: true,
  isMuted: true,
  volume: 70,
  awaitingUserGesture: true,
  lastError: null,
}

const base: OSState = {
  windows: {},
  focusedWindowId: null,
  selectedIconId: null,
  startMenuOpen: false,
  shuttingDown: false,
  nextZIndex: 20,
  music,
  reducedMotion: false,
}

describe('OSState covers the mockup interactions', () => {
  it('empty desktop: nothing open, nothing selected', () => {
    expect(Object.keys(base.windows)).toHaveLength(0)
    expect(base.focusedWindowId).toBeNull()
  })

  it('icon selection (mockup .icon.selected)', () => {
    const s: OSState = { ...base, selectedIconId: 'projects' }
    expect(s.selectedIconId).toBe('projects')
  })

  it('open window: one entry, focused, z-index taken from the counter', () => {
    const s: OSState = {
      ...base,
      windows: { projects: win('projects', 'projects', { zIndex: 20 }) },
      focusedWindowId: 'projects',
      nextZIndex: 21,
    }
    expect(s.windows['projects']?.zIndex).toBe(20)
    expect(s.nextZIndex).toBeGreaterThan(s.windows['projects']!.zIndex)
  })

  it('drag: x/y move independently of size', () => {
    const dragged = win('projects', 'projects', { x: 610, y: 140 })
    expect([dragged.x, dragged.y]).toEqual([610, 140])
    expect([dragged.width, dragged.height]).toEqual([420, 330])
  })

  it('resize: width/height change, position is unchanged, minimums respected', () => {
    const resized = win('projects', 'projects', { width: 280, height: 200 })
    expect(resized.width).toBeGreaterThanOrEqual(280)
    expect(resized.height).toBeGreaterThanOrEqual(200)
    expect([resized.x, resized.y]).toEqual([250, 90])
  })

  it('minimize: still in state (so the taskbar tab survives), just flagged', () => {
    const s: OSState = {
      ...base,
      windows: { projects: win('projects', 'projects', { minimized: true }) },
      focusedWindowId: null,
    }
    expect(s.windows['projects']).toBeDefined()
    expect(s.windows['projects']?.minimized).toBe(true)
  })

  it('maximize: prevBounds holds exactly what un-maximizing must restore', () => {
    const before = win('projects', 'projects')
    const maximized: WindowState = {
      ...before,
      maximized: true,
      x: 20,
      y: 20,
      width: 680,
      height: 460,
      prevBounds: { x: before.x, y: before.y, width: before.width, height: before.height },
    }
    expect(maximized.prevBounds).toEqual({ x: 250, y: 90, width: 420, height: 330 })

    const restored: WindowState = { ...maximized, ...maximized.prevBounds, maximized: false }
    expect(restored).toMatchObject({ x: 250, y: 90, width: 420, height: 330, maximized: false })
  })

  it('close: the entry is gone entirely, not flagged', () => {
    const open: OSState = {
      ...base,
      windows: { projects: win('projects', 'projects') },
      focusedWindowId: 'projects',
    }
    const { projects: _closed, ...rest } = open.windows
    const s: OSState = { ...open, windows: rest, focusedWindowId: null }
    expect(s.windows['projects']).toBeUndefined()
  })

  it('focus order: highest zIndex is the focused window, with 3 open', () => {
    const s: OSState = {
      ...base,
      windows: {
        about: win('about', 'about', { zIndex: 20 }),
        projects: win('projects', 'projects', { zIndex: 21 }),
        terminal: win('terminal', 'terminal', { zIndex: 22 }),
      },
      focusedWindowId: 'terminal',
      nextZIndex: 23,
    }
    const top = Object.values(s.windows).reduce((a, b) => (b.zIndex > a.zIndex ? b : a))
    expect(top.id).toBe(s.focusedWindowId)
  })

  it('taskbar tab order follows insertion order, not z-index', () => {
    // Opened about → projects → terminal, then focused `about` (raising its
    // z-index). Tabs must still read about, projects, terminal.
    const s: OSState = {
      ...base,
      windows: {
        about: win('about', 'about', { zIndex: 23 }),
        projects: win('projects', 'projects', { zIndex: 21 }),
        terminal: win('terminal', 'terminal', { zIndex: 22 }),
      },
      focusedWindowId: 'about',
      nextZIndex: 24,
    }
    expect(Object.keys(s.windows)).toEqual(['about', 'projects', 'terminal'])
  })

  it('start menu and the joke shutdown overlay are separate flags', () => {
    const open: OSState = { ...base, startMenuOpen: true }
    const down: OSState = { ...open, startMenuOpen: false, shuttingDown: true }
    expect([down.startMenuOpen, down.shuttingDown]).toEqual([false, true])
  })
})

describe('MusicState covers the music interactions', () => {
  it('default track, muted-autoplaying, awaiting a gesture (first load)', () => {
    expect(base.music).toMatchObject({
      isDefaultTrack: true,
      isMuted: true,
      awaitingUserGesture: true,
      lastError: null,
    })
  })

  it('gesture resolved: unmuted and no longer waiting', () => {
    const s: MusicState = { ...music, isMuted: false, awaitingUserGesture: false }
    expect([s.isMuted, s.awaitingUserGesture]).toEqual([false, false])
  })

  it('visitor supplies a custom track: isDefaultTrack flips', () => {
    const s: MusicState = { ...music, videoId: 'abc12345678', isDefaultTrack: false }
    expect([s.videoId, s.isDefaultTrack]).toEqual(['abc12345678', false])
  })

  it('mute is independent of volume, so unmuting restores the level', () => {
    const muted: MusicState = { ...music, isMuted: true, volume: 70 }
    expect({ ...muted, isMuted: false }.volume).toBe(70)
  })

  it('bad URL sets a friendly message and leaves the track playing', () => {
    const s: MusicState = { ...music, lastError: "Couldn't parse that URL" }
    expect(s.lastError).toBeTruthy()
    expect(s.videoId).toBe(music.videoId)
  })

  it('pause/play is a flag, not an absence of a track', () => {
    const s: MusicState = { ...music, isPlaying: false }
    expect(s.videoId).toBeTruthy()
  })
})
