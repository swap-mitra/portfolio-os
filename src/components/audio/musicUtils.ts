/* YouTube URL parsing (architecture.md §8.2, SPIKE-19).

   This is the app's only untrusted-input boundary: whatever a visitor pastes
   lands here and, if accepted, is handed straight to `loadVideoById`. It must
   never throw and must never return anything that isn't a well-formed video
   ID. */

/** YouTube video IDs are exactly 11 chars of [A-Za-z0-9_-]. Same rule as
    persistence.ts, for the same reason. */
const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/

const HOSTS = new Set([
  'youtube.com',
  'www.youtube.com',
  'm.youtube.com',
  'music.youtube.com',
  'youtu.be',
  'www.youtu.be',
])

/** Path prefixes that carry the ID as the next segment: /embed/ID, /shorts/ID,
    /live/ID. */
const PATH_PREFIXES = new Set(['embed', 'shorts', 'live', 'v'])

/** Extract a video ID from anything a visitor might paste, or `null` if there
    isn't one. Never throws. */
export function extractVideoId(input: string): string | null {
  const trimmed = input.trim()
  if (trimmed === '') return null

  // A bare ID is what you get from copying it out of a URL by hand; accepting
  // it costs one line and saves an inexplicable rejection.
  if (VIDEO_ID.test(trimmed)) return trimmed

  let url: URL
  try {
    // Bare hosts ("youtu.be/ID") are common in pasted text; URL needs a scheme.
    url = new URL(trimmed.includes('://') ? trimmed : `https://${trimmed}`)
  } catch {
    return null
  }

  if (!HOSTS.has(url.hostname)) return null

  // watch?v=ID, with any number of extra params (&t=30s and friends).
  const v = url.searchParams.get('v')
  if (v !== null && VIDEO_ID.test(v)) return v

  const [first, second] = url.pathname.split('/').filter(Boolean)
  if (first === undefined) return null

  // youtu.be/ID puts the ID directly in the path.
  if (url.hostname.endsWith('youtu.be')) return VIDEO_ID.test(first) ? first : null

  if (PATH_PREFIXES.has(first) && second !== undefined && VIDEO_ID.test(second)) return second

  return null
}

/** Message shown when the above returns null. Friendly on purpose: this is
    read by a visitor who pasted the wrong thing, not by a developer. */
export const PARSE_ERROR = "Couldn't find a video in that link. Try pasting the full YouTube URL."

/** Subset of `YT.PlayerState` we act on. */
export const ENDED = 0
export const PLAYING = 1
export const PAUSED = 2

/** The player's `onError` codes, per the IFrame API reference. They mean
    genuinely different things to a visitor (one is "pick another video",
    another is "this one is gone", another is "reload"), and collapsing them
    into a single message also threw away the only clue about which of the
    five actually happened. */
export function playerErrorMessage(code: number): string {
  switch (code) {
    case 2:
      return "That video ID isn't valid. Try pasting the full YouTube URL."
    case 5:
      return "The player couldn't load that video. Reloading the page usually fixes it."
    case 100:
      return "That video doesn't exist any more, or it's private."
    case 101:
    case 150:
      return "That video's owner doesn't allow it to be played on other sites. Try another one."
    default:
      return `The player refused that video (YouTube error ${code}). Try a different one.`
  }
}
