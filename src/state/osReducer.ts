/* The window manager's single source of truth (architecture.md §3, §5).
   Pure: no DOM reads, no clock, no randomness — everything the reducer needs
   arrives in the action payload, which is what makes it testable. */

import type { AppType, OSState, WindowBounds, WindowState } from '../types/os'

/** Resize floor, per architecture.md §5. The resize hook must clamp to the
    same numbers, so they live here rather than being typed twice. */
export const MIN_WIDTH = 280
export const MIN_HEIGHT = 200

/** Opening size, per app. The mockup's single 420x330 `.win` was a stand-in
    for a window with three lines of placeholder text in it; real content
    needs more, and needs different amounts. The terminal wants width so
    output doesn't wrap mid-thought, the resume wants height because it is
    showing a page. Clamped to the viewport on open, so a small screen gets a
    smaller window rather than one hanging off the edge. */
export const OPEN_SIZE: Record<AppType, { width: number; height: number }> = {
  about: { width: 620, height: 470 },
  projects: { width: 680, height: 530 },
  resume: { width: 640, height: 580 },
  contact: { width: 520, height: 280 },
  terminal: { width: 700, height: 470 },
}

/** Breathing room kept between a freshly opened window and the viewport edge. */
const OPEN_MARGIN = 16

/** Each additional open window steps down-right so they don't stack exactly
    on top of each other, wrapping before it can march off-screen. */
const CASCADE_STEP = 26
const CASCADE_WRAP = 5

/** Maximize is "expanded but bounded", not fullscreen — the desktop stays
    visible behind it (architecture.md §5). Mirrors the mockup's
    `min(680px, 100% - 40px)` / `min(460px, 100% - 120px)`. */
const MAX_WIDTH = 680
const MAX_HEIGHT = 460
const MAX_MARGIN = 20
/** Vertical room left for the 44px taskbar plus breathing space. */
const MAX_VERTICAL_INSET = 120

/** Volume the first gesture restores to when the stored preference is 0.
    Also the starting volume, so the two can't drift apart. */
const AUDIBLE_VOLUME = 70

/** Base z-index for windows, matching `--z-windows` in tokens.css. */
const BASE_Z_INDEX = 20

export interface Viewport {
  width: number
  height: number
}

export type Action =
  | { type: 'OPEN_WINDOW'; appType: AppType; viewport: Viewport }
  | { type: 'CLOSE_WINDOW'; id: string }
  | { type: 'FOCUS_WINDOW'; id: string }
  | { type: 'MOVE_WINDOW'; id: string; x: number; y: number }
  | { type: 'RESIZE_WINDOW'; id: string; width: number; height: number }
  | { type: 'MINIMIZE_WINDOW'; id: string }
  | { type: 'RESTORE_WINDOW'; id: string }
  | { type: 'TOGGLE_MAXIMIZE'; id: string; viewport: Viewport }
  | { type: 'SELECT_ICON'; appType: AppType | null }
  | { type: 'TOGGLE_START_MENU' }
  | { type: 'CLOSE_START_MENU' }
  | { type: 'SET_SHUTDOWN'; shuttingDown: boolean }
  | { type: 'LOAD_TRACK'; videoId: string; isDefaultTrack?: boolean }
  | { type: 'MUSIC_ERROR'; message: string }
  | { type: 'PLAY_MUSIC' }
  | { type: 'PAUSE_MUSIC' }
  | { type: 'SET_VOLUME'; volume: number }
  | { type: 'TOGGLE_MUTE' }
  | { type: 'MUSIC_GESTURE_RESOLVED' }
  | { type: 'SET_REDUCED_MOTION'; reducedMotion: boolean }

export const initialState: OSState = {
  windows: {},
  focusedWindowId: null,
  selectedIconId: null,
  startMenuOpen: false,
  shuttingDown: false,
  nextZIndex: BASE_Z_INDEX,
  music: {
    // Empty until MusicPlayer loads siteConfig's default track (SPIKE-18) or
    // persistence restores the visitor's last pick (SPIKE-05).
    videoId: '',
    isDefaultTrack: true,
    isPlaying: false,
    isMuted: true,
    volume: AUDIBLE_VOLUME,
    awaitingUserGesture: true,
    lastError: null,
  },
  reducedMotion: false,
}

/** `Math.min(Math.max())`, but safe when the range is inverted: a viewport
    too small for the minimum size must still yield the minimum, not a
    negative. */
const clamp = (value: number, lo: number, hi: number): number =>
  Math.min(Math.max(value, lo), Math.max(lo, hi))

const bounds = (w: WindowState): WindowBounds => ({
  x: w.x,
  y: w.y,
  width: w.width,
  height: w.height,
})

/** The visible window with the highest z-index, ignoring `exceptId`. Used to
    hand focus somewhere sensible when the focused window goes away, rather
    than dropping it to null and losing keyboard position (SPIKE-28). */
const topmostVisible = (windows: Record<string, WindowState>, exceptId?: string): string | null => {
  let top: WindowState | null = null
  for (const w of Object.values(windows)) {
    if (w.id === exceptId || w.minimized) continue
    if (top === null || w.zIndex > top.zIndex) top = w
  }
  return top?.id ?? null
}

/** Raise a window to the front and focus it. */
const focus = (state: OSState, id: string): OSState => {
  const target = state.windows[id]
  if (target === undefined) return state
  // Already frontmost and visible: don't burn a z-index on every pointerdown.
  if (state.focusedWindowId === id && !target.minimized) return state

  return {
    ...state,
    windows: {
      ...state.windows,
      [id]: { ...target, minimized: false, zIndex: state.nextZIndex },
    },
    focusedWindowId: id,
    nextZIndex: state.nextZIndex + 1,
  }
}

/** Apply a partial update to one window, or return state untouched if the id
    is unknown (a stale pointer event after a close, say). */
const patchWindow = (state: OSState, id: string, patch: Partial<WindowState>): OSState => {
  const target = state.windows[id]
  if (target === undefined) return state
  return { ...state, windows: { ...state.windows, [id]: { ...target, ...patch } } }
}

export function osReducer(state: OSState, action: Action): OSState {
  switch (action.type) {
    case 'OPEN_WINDOW': {
      // One window per app (architecture.md §3): re-opening focuses and
      // un-minimizes the existing window instead of stacking a duplicate.
      const existing = state.windows[action.appType]
      if (existing !== undefined) return focus(state, existing.id)

      const step = Object.keys(state.windows).length % CASCADE_WRAP
      const wanted = OPEN_SIZE[action.appType]
      const { width: vw, height: vh } = action.viewport
      const width = clamp(wanted.width, MIN_WIDTH, vw - OPEN_MARGIN * 2)
      const height = clamp(wanted.height, MIN_HEIGHT, vh - MAX_VERTICAL_INSET)

      /* Centred, then stepped down-right per window already open, so a stack
         of them fans out from the middle instead of hugging a corner. */
      const created: WindowState = {
        id: action.appType,
        appType: action.appType,
        x: clamp(
          Math.round((vw - width) / 2) + step * CASCADE_STEP,
          OPEN_MARGIN,
          vw - width - OPEN_MARGIN,
        ),
        y: clamp(
          Math.round((vh - MAX_VERTICAL_INSET - height) / 2) + step * CASCADE_STEP,
          OPEN_MARGIN,
          vh - MAX_VERTICAL_INSET - height + OPEN_MARGIN,
        ),
        width,
        height,
        zIndex: state.nextZIndex,
        minimized: false,
        maximized: false,
      }
      return {
        ...state,
        windows: { ...state.windows, [created.id]: created },
        focusedWindowId: created.id,
        nextZIndex: state.nextZIndex + 1,
        startMenuOpen: false,
      }
    }

    case 'CLOSE_WINDOW': {
      if (state.windows[action.id] === undefined) return state
      const { [action.id]: _removed, ...remaining } = state.windows
      return {
        ...state,
        windows: remaining,
        focusedWindowId:
          state.focusedWindowId === action.id
            ? topmostVisible(remaining)
            : state.focusedWindowId,
      }
    }

    case 'FOCUS_WINDOW':
      return focus(state, action.id)

    case 'MOVE_WINDOW':
      // Clamping to the viewport is the drag hook's job (SPIKE-06) — it's the
      // only party that knows the viewport and the pointer offset.
      return patchWindow(state, action.id, { x: action.x, y: action.y })

    case 'RESIZE_WINDOW':
      return patchWindow(state, action.id, {
        width: Math.max(MIN_WIDTH, action.width),
        height: Math.max(MIN_HEIGHT, action.height),
      })

    case 'MINIMIZE_WINDOW': {
      const next = patchWindow(state, action.id, { minimized: true })
      if (next === state) return state
      return {
        ...next,
        // Hand focus to whatever is now on top; the tab stays in the taskbar.
        focusedWindowId:
          state.focusedWindowId === action.id
            ? topmostVisible(next.windows, action.id)
            : state.focusedWindowId,
      }
    }

    case 'RESTORE_WINDOW':
      // Un-minimize and raise. `focus` already clears `minimized`, but it
      // short-circuits when the window is already focused, so clear it first.
      return focus(patchWindow(state, action.id, { minimized: false }), action.id)

    case 'TOGGLE_MAXIMIZE': {
      const target = state.windows[action.id]
      if (target === undefined) return state

      if (target.maximized) {
        // A maximized window always has prevBounds; the fallback is only
        // here so the type doesn't have to lie about that.
        const restored = target.prevBounds ?? { x: 40, y: 40, ...OPEN_SIZE[target.appType] }
        return patchWindow(state, action.id, {
          ...restored,
          maximized: false,
          prevBounds: undefined,
        })
      }

      return patchWindow(state, action.id, {
        prevBounds: bounds(target),
        maximized: true,
        x: MAX_MARGIN,
        y: MAX_MARGIN,
        width: Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, action.viewport.width - MAX_MARGIN * 2)),
        height: Math.max(
          MIN_HEIGHT,
          Math.min(MAX_HEIGHT, action.viewport.height - MAX_VERTICAL_INSET),
        ),
      })
    }

    case 'SELECT_ICON':
      return { ...state, selectedIconId: action.appType }

    case 'TOGGLE_START_MENU':
      return { ...state, startMenuOpen: !state.startMenuOpen }

    case 'CLOSE_START_MENU':
      return state.startMenuOpen ? { ...state, startMenuOpen: false } : state

    case 'SET_SHUTDOWN':
      return { ...state, shuttingDown: action.shuttingDown, startMenuOpen: false }

    case 'LOAD_TRACK':
      return {
        ...state,
        music: {
          ...state.music,
          videoId: action.videoId,
          isDefaultTrack: action.isDefaultTrack ?? false,
          isPlaying: true,
          lastError: null,
        },
      }

    case 'MUSIC_ERROR':
      // Deliberately leaves videoId/isPlaying alone: a bad URL must not stop
      // whatever is currently playing.
      return { ...state, music: { ...state.music, lastError: action.message } }

    case 'PLAY_MUSIC':
      return { ...state, music: { ...state.music, isPlaying: true } }

    case 'PAUSE_MUSIC':
      return { ...state, music: { ...state.music, isPlaying: false } }

    case 'SET_VOLUME':
      return {
        ...state,
        music: {
          ...state.music,
          volume: Math.min(100, Math.max(0, action.volume)),
          // Dragging the slider up is an implicit unmute; leaving it muted
          // makes the control look broken.
          isMuted: action.volume > 0 ? false : state.music.isMuted,
        },
      }

    case 'TOGGLE_MUTE':
      return { ...state, music: { ...state.music, isMuted: !state.music.isMuted } }

    case 'MUSIC_GESTURE_RESOLVED':
      return {
        ...state,
        music: {
          ...state.music,
          isMuted: false,
          awaitingUserGesture: false,
          isPlaying: true,
          /* Unmuting into volume 0 is not unmuting. A stored 0 outlives the
             session it was set in, and nothing else ever raises it, so the
             site came back silent for good while the play button read
             "playing" and the mute button read "unmuted". This gesture's
             whole job is to make sound happen. */
          volume: state.music.volume === 0 ? AUDIBLE_VOLUME : state.music.volume,
        },
      }

    case 'SET_REDUCED_MOTION':
      return { ...state, reducedMotion: action.reducedMotion }
  }
}
