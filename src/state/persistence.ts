/* localStorage persistence (architecture.md §3).

   Scope decision from SPIKE-05: the visitor's **music preferences persist,
   window layout does not**. Minesweeper best times persist too, under their
   own key, for the same reason music does: they are small, viewport-
   independent, and worthless to a visitor if thrown away every visit. Restoring windows would mean a returning visitor
   lands on a desktop already buried under windows, never seeing the desktop
   the whole design is built around — and saved coordinates are viewport-
   relative, so a layout saved on a wide monitor reopens off-screen on a
   laptop. Music state is four viewport-independent scalars, and silently
   re-blasting audio at a volume the visitor already turned down is the kind
   of thing people close tabs over.

   Every read is defensive. Persisted data is untrusted input: it may be
   absent, stale, hand-edited, or from a future schema. Anything unexpected is
   discarded field-by-field and the default is used instead — a returning
   visitor must never get a broken desktop because of it. */

import type { MusicState, OSState } from '../types/os'
import { LEVELS } from '../components/apps/minesweeper'
import type { LevelName } from '../components/apps/minesweeper'
import { initialState } from './osReducer'

/* Schema version lives in the key, so a future shape change just moves to
   :v2 and stale v1 data is ignored, with no migration code to write. */
const KEY = 'portfolio-os:music:v1'
const BEST_TIMES_KEY = 'portfolio-os:minesweeper:v1'

const SAVE_DEBOUNCE_MS = 300

/** The four fields worth persisting. Explicitly excluded:
    - `isPlaying` / `awaitingUserGesture` — autoplay policy governs these on
      every load regardless of what a returning visitor had before (§8.3), so
      restoring them would be actively wrong.
    - `lastError` — a stale error message on a fresh load is nonsense. */
interface PersistedMusic {
  videoId: string
  isDefaultTrack: boolean
  volume: number
  isMuted: boolean
}

/** YouTube video IDs are exactly 11 chars of [A-Za-z0-9_-]. Worth checking
    because this value gets handed to `loadVideoById`. */
const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/

/** Accessing localStorage can itself throw (Safari private mode and blocked
    cookies both do it), so even the lookup is guarded. */
function storage(): Storage | null {
  try {
    return globalThis.localStorage ?? null
  } catch {
    return null
  }
}

/** Read persisted music preferences, keeping only fields that survive
    validation. Returns an empty object if there's nothing usable. */
export function loadMusicState(): Partial<PersistedMusic> {
  const store = storage()
  if (store === null) return {}

  let raw: string | null
  try {
    raw = store.getItem(KEY)
  } catch {
    return {}
  }
  if (raw === null) return {}

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return {}
  }
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return {}

  const record = parsed as Record<string, unknown>
  const result: Partial<PersistedMusic> = {}

  // Validated one field at a time: one corrupt value shouldn't discard the
  // rest of a visitor's preferences.
  if (typeof record['videoId'] === 'string' && VIDEO_ID.test(record['videoId'])) {
    result.videoId = record['videoId']
  }
  if (typeof record['isDefaultTrack'] === 'boolean') {
    result.isDefaultTrack = record['isDefaultTrack']
  }
  if (
    typeof record['volume'] === 'number' &&
    Number.isFinite(record['volume']) &&
    record['volume'] >= 0 &&
    record['volume'] <= 100
  ) {
    result.volume = record['volume']
  }
  if (typeof record['isMuted'] === 'boolean') {
    result.isMuted = record['isMuted']
  }

  return result
}

/** Write immediately. Exported for tests and for flushing on unload. */
export function saveMusicStateNow(music: MusicState): void {
  const store = storage()
  if (store === null) return

  const payload: PersistedMusic = {
    videoId: music.videoId,
    isDefaultTrack: music.isDefaultTrack,
    volume: music.volume,
    isMuted: music.isMuted,
  }
  try {
    store.setItem(KEY, JSON.stringify(payload))
  } catch {
    // Quota exceeded, or storage disabled mid-session. Losing a volume
    // preference is not worth breaking the page over.
  }
}

let saveTimer: ReturnType<typeof setTimeout> | undefined

/** Debounced write — dragging the volume slider fires a change per pixel. */
export function saveMusicState(music: MusicState): void {
  if (saveTimer !== undefined) clearTimeout(saveTimer)
  saveTimer = setTimeout(() => {
    saveTimer = undefined
    saveMusicStateNow(music)
  }, SAVE_DEBOUNCE_MS)
}

/** Merge persisted preferences over the defaults. Merging rather than
    replacing means a field added to `MusicState` later still gets its default
    on a visitor whose stored blob predates it. */
export function hydrateInitialState(base: OSState = initialState): OSState {
  const saved = loadMusicState()

  /* A stored default track is not a preference, it is a copy of whatever
     DEFAULT_VIDEO_ID happened to be on the visitor's last visit. Restoring it
     would pin every returning visitor to that old ID forever, so changing the
     constant (as we had to when the previous default stopped allowing embeds)
     would reach new visitors only. Dropping it lets MusicPlayer's empty-videoId
     branch apply the current default. A track the visitor actually chose is
     still restored. */
  if (saved.isDefaultTrack === true) delete saved.videoId

  return {
    ...base,
    music: {
      ...base.music,
      ...saved,
      // Always re-enter the muted-autoplay flow, whatever was stored. A
      // returning visitor gets no more of a gesture exemption than a new one
      // (§8.3), so these two are pinned after the spread on purpose.
      isPlaying: false,
      awaitingUserGesture: true,
      lastError: null,
    },
  }
}

/** Discard stored preferences. Not wired to UI; exists so a stuck visitor can
    run it from the console, and so tests can reset between cases. */
export function clearPersistedState(): void {
  try {
    storage()?.removeItem(KEY)
  } catch {
    // Nothing useful to do.
  }
}

/* Minesweeper best times, in seconds, keyed by level name.

   Kept here rather than in minesweeper.ts because that module is pure and
   worth keeping that way, and because this file already owns the rules for
   reading untrusted stored data. Same discipline as the music blob: every
   field is validated on the way in, and anything unrecognised is dropped
   rather than trusted into the UI. */

export type BestTimes = Partial<Record<LevelName, number>>

/** A time is only usable if it is a whole, positive, plausible number of
    seconds. `999` is what the readout clamps to, so nothing above it can
    even be displayed. */
const isUsableTime = (value: unknown): value is number =>
  typeof value === 'number' && Number.isInteger(value) && value > 0 && value <= 999

export function loadBestTimes(): BestTimes {
  const store = storage()
  if (store === null) return {}

  let parsed: unknown
  try {
    const raw = store.getItem(BEST_TIMES_KEY)
    if (raw === null) return {}
    parsed = JSON.parse(raw)
  } catch {
    return {}
  }
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return {}

  const record = parsed as Record<string, unknown>
  const result: BestTimes = {}
  for (const [level, value] of Object.entries(record)) {
    // Keys are as untrusted as values: a hand-edited blob can name a level
    // that doesn't exist, and it has no business reaching the UI.
    if (level in LEVELS && isUsableTime(value)) result[level as LevelName] = value
  }
  return result
}

/** Record `seconds` if it beats the stored time for that level. Returns the
    times as they now stand, so the caller can render without a second read. */
export function saveBestTime(level: LevelName, seconds: number): BestTimes {
  const current = loadBestTimes()
  const previous = current[level]
  if (!isUsableTime(seconds) || (previous !== undefined && previous <= seconds)) return current

  const updated = { ...current, [level]: seconds }
  try {
    storage()?.setItem(BEST_TIMES_KEY, JSON.stringify(updated))
  } catch {
    // Losing a high score is not worth breaking the game over.
  }
  return updated
}
