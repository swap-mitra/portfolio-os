/* Core OS state contract (architecture.md §3). Every later phase builds
   against these types, so changes here are expensive after Phase 1. */

export type AppType = 'about' | 'projects' | 'resume' | 'contact' | 'terminal'

/** Position + size of a window. Named because maximize/restore, the resize
    hook, and the reducer's action payloads all pass the same four numbers. */
export interface WindowBounds {
  x: number
  y: number
  width: number
  height: number
}

export interface WindowState extends WindowBounds {
  /** Unique per open window. Today this is just the `appType`, because the
      mockup opens at most one window per app — re-activating an app focuses
      the existing window rather than opening a second. Kept as `string` so
      allowing multiple instances later doesn't require a type change. */
  id: string
  appType: AppType
  zIndex: number
  minimized: boolean
  maximized: boolean
  /** Bounds to return to when un-maximizing. Only set while `maximized`. */
  prevBounds?: WindowBounds
}

export interface MusicState {
  /** Currently loaded YouTube video ID. */
  videoId: string
  /** True until the visitor supplies their own URL (drives the "default
      track" vs "your pick" label — architecture.md §8.4). */
  isDefaultTrack: boolean
  isPlaying: boolean
  isMuted: boolean
  /** 0-100, matching the YouTube IFrame API's setVolume range. */
  volume: number
  /** True while playback is muted-autoplaying and still waiting for the
      first user gesture to unmute (architecture.md §8.3). */
  awaitingUserGesture: boolean
  /** Friendly message for an unparseable URL, e.g. "Couldn't parse that
      URL". Never a raw exception string — this is user-facing. */
  lastError: string | null
}

export interface OSState {
  /** Keyed by `WindowState.id`. Iteration order is insertion order (the IDs
      are never integer-like), which is what the taskbar renders tabs in — so
      tabs stay put instead of reordering when focus changes. */
  windows: Record<string, WindowState>
  focusedWindowId: string | null
  selectedIconId: AppType | null
  startMenuOpen: boolean
  /** Shows the joke shutdown overlay (project-spec.md FR7). */
  shuttingDown: boolean
  /** Incrementing counter for bring-to-front. */
  nextZIndex: number
  music: MusicState
}
