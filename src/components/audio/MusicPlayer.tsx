/* Background music widget (architecture.md §8, SPIKE-18/20/21/22).

   Not a Window, just a small persistent widget pinned above the taskbar. It
   owns the YT.Player instance; OSState owns the truth about what should be
   playing, and effects below push that truth into the player. The player only
   ever pushes back through onStateChange, so the button can't drift out of
   sync with what's actually coming out of the speakers. */

import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import './MusicPlayer.css'
import { useOS } from '../../state/osContext'
import { DEFAULT_TRACKS, DEFAULT_VIDEO_ID, trackCredit } from '../../data/siteConfig'
import { ENDED, PARSE_ERROR, PAUSED, PLAYING, extractVideoId, playerErrorMessage } from './musicUtils'
import { playDialup } from './retroSound'
import type { YTApi, YTPlayer } from '../../types/youtube'

const API_SRC = 'https://www.youtube.com/iframe_api'

/* Module-level, not per-component: the script may only be injected once, and
   the API's ready callback is a single global. A promise makes both the
   "already loaded" and "loading right now" cases fall out for free, which is
   what makes StrictMode's double-mount harmless (architecture.md §8.1). */
let apiPromise: Promise<YTApi> | undefined

interface PastedTrack {
  videoId: string
  /** What the player reports once metadata arrives. Empty until then, and
      the widget falls back to showing the ID. */
  title: string
}

/** `getVideoData` is undocumented, and this runs inside YouTube's own event
    dispatch, where a throw would take the rest of the handler with it. A
    missing title is worth nothing; a broken player is worth less. */
function readVideoData(player: YTPlayer): { video_id?: string; title?: string } | undefined {
  try {
    return player.getVideoData?.()
  } catch {
    return undefined
  }
}

function loadIframeApi(): Promise<YTApi> {
  apiPromise ??= new Promise<YTApi>((resolve) => {
    if (window.YT?.Player !== undefined) {
      resolve(window.YT)
      return
    }
    window.onYouTubeIframeAPIReady = () => {
      // Non-null: the API guarantees window.YT exists before it calls this.
      resolve(window.YT as YTApi)
    }
    const script = document.createElement('script')
    script.src = API_SRC
    document.head.appendChild(script)
  })
  return apiPromise
}

export function MusicPlayer() {
  const { state, dispatch } = useOS()
  const music = state.music
  const hostRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<YTPlayer | null>(null)
  const loadedId = useRef<string | null>(null)
  /* True from asking for a new track until the player reports it playing.
     Swapping a track emits a transient PAUSED on the way through, and taking
     that as the truth is what left the next track sitting paused. */
  const swapping = useRef(false)
  const [ready, setReady] = useState(false)
  const [url, setUrl] = useState('')
  /* Tracks the visitor supplied, appended to the carousel so stepping away
     from one can step back to it. Component state rather than the reducer or
     localStorage: MusicPlayer is mounted for the life of the tab, which is
     exactly how long this should last. */
  const [pasted, setPasted] = useState<PastedTrack[]>([])

  /* initialState leaves videoId empty so this component decides the default
     (or persistence already restored the visitor's last pick). */
  useEffect(() => {
    if (music.videoId === '') {
      dispatch({ type: 'LOAD_TRACK', videoId: DEFAULT_VIDEO_ID, isDefaultTrack: true })
    }
  }, [music.videoId, dispatch])

  /* Build the player once, as soon as we know what to load. */
  useEffect(() => {
    if (music.videoId === '' || playerRef.current !== null) return

    let cancelled = false
    const videoId = music.videoId
    loadedId.current = videoId

    void loadIframeApi().then((YT) => {
      if (cancelled || hostRef.current === null) return
      /* YT.Player *replaces* the element it's given with its iframe, so it
         gets a child React doesn't own. Handing it a React-rendered node
         leaves React holding a reference to a node that's no longer in the
         tree. */
      const host = document.createElement('div')
      hostRef.current.appendChild(host)
      playerRef.current = new YT.Player(host, {
        videoId,
        /* `mute: 1` is load-bearing, not a duplicate of the mute() below.
           The iframe attempts its autoplay as soon as it loads, and an
           unmuted attempt is blocked before onReady ever runs, which left
           the player parked in UNSTARTED with nothing to restart it. Muting
           in the URL means the attempt is a permitted one. */
        playerVars: { autoplay: 1, mute: 1, controls: 0, playsinline: 1, disablekb: 1 },
        events: {
          onReady: (e) => {
            /* Muted first, always: unmuted autoplay without a gesture is
               blocked everywhere, and a blocked play() means no playback at
               all rather than silent playback (§8.3). */
            e.target.mute()
            e.target.playVideo()
            setReady(true)
          },
          onStateChange: (e) => {
            if (e.data === PLAYING) {
              swapping.current = false
              dispatch({ type: 'PLAY_MUSIC' })
              /* Metadata is only reliable once playback has started, and it
                 describes what is loaded now rather than the ID this effect
                 closed over however many tracks ago. */
              const data = readVideoData(e.target)
              const id = data?.video_id
              const title = data?.title
              if (id !== undefined && title !== undefined && title !== '') {
                setPasted((current) =>
                  // Same array back when nothing matched, so a shipped track
                  // starting does not re-render the widget for no reason.
                  current.some((track) => track.videoId === id && track.title !== title)
                    ? current.map((track) => (track.videoId === id ? { ...track, title } : track))
                    : current,
                )
              }
            } else if (e.data === PAUSED) {
              // Only a pause the visitor asked for. Mid-swap, the new track
              // is on its way in and nothing has been paused.
              if (!swapping.current) dispatch({ type: 'PAUSE_MUSIC' })
            }
            // Background music that dies after one track isn't background
            // music. Cheaper than playerVars.loop, which needs a playlist
            // param and stops working after loadVideoById.
            else if (e.data === ENDED) e.target.playVideo()
          },
          onError: (e) => {
            /* The code is the only diagnosis there is, since YouTube
               reports the reason nowhere else, so it goes to the console even though
               the visitor gets prose. */
            console.error('YouTube player error', e.data, 'for video', videoId)
            dispatch({ type: 'MUSIC_ERROR', message: playerErrorMessage(e.data) })
          },
        },
      })
    })

    return () => {
      cancelled = true
    }
    /* This effect must not depend on anything that changes while it runs.
       The guard on the first line returns early once playerRef.current is
       set, but that pointer stays null for the whole of the loadIframeApi()
       round trip, so a re-run in that window would sail past the guard and
       construct a SECOND YT.Player: two iframes, both playing, one of them
       unreachable.

       It used to seed the player's volume here, which put music.volume in
       that position and made dragging the slider during those few hundred
       milliseconds the way to hit it. Nothing seeds volume now: onReady only
       flips `ready`, and the sync effect below owns volume from that point,
       running on the same flip. One owner, no duplicate call, no dependency
       to argue about. */
  }, [music.videoId, dispatch])

  /* Anything playing that the site didn't ship belongs to the visitor,
     whether they just pasted it or localStorage restored it on a return
     visit. Registering it here rather than in the submit handler covers both
     without a second code path. */
  useEffect(() => {
    if (music.videoId === '' || trackCredit(music.videoId) !== undefined) return
    setPasted((current) =>
      current.some((track) => track.videoId === music.videoId)
        ? current
        : [...current, { videoId: music.videoId, title: '' }],
    )
  }, [music.videoId])

  /* First interaction anywhere on the page unmutes (§8.3). Deliberately on
     document, not the widget: most visitors' first click is a desktop icon. */
  useEffect(() => {
    if (!music.awaitingUserGesture) return

    /* The modem screech, once. A touch fires both touchstart and pointerdown
       before the reducer has cleared awaitingUserGesture, so the guard is
       here rather than in state. The gesture that unmutes is the one moment
       the site starts making sound, which is exactly what a dial-up was. */
    let dialled = false
    const resolve = () => {
      if (dialled) return
      dialled = true
      playDialup()
      dispatch({ type: 'MUSIC_GESTURE_RESOLVED' })
    }
    const events = ['pointerdown', 'keydown', 'touchstart'] as const
    for (const name of events) document.addEventListener(name, resolve)
    return () => {
      for (const name of events) document.removeEventListener(name, resolve)
    }
  }, [music.awaitingUserGesture, dispatch])

  /* State → player. One effect per field, each a no-op until the player is
     ready; whatever changed while it was loading is applied on the ready
     flip, since `ready` is a dependency of every one of them. */
  useEffect(() => {
    if (ready) playerRef.current?.setVolume(music.volume)
  }, [ready, music.volume])

  useEffect(() => {
    if (!ready) return
    if (music.isMuted) playerRef.current?.mute()
    else playerRef.current?.unMute()
  }, [ready, music.isMuted])

  /* `awaitingUserGesture` is in here because the first gesture is a reason
     to re-assert playback, not just to unmute. LOAD_TRACK sets `isPlaying`
     optimistically at load, so if the browser refused that first play the
     flag never changes again and this effect never re-runs: the widget reads
     "playing" over a silent player, for good. Re-running it on the gesture
     retries the play with user activation behind it. */
  useEffect(() => {
    if (!ready) return
    if (music.isPlaying) playerRef.current?.playVideo()
    else playerRef.current?.pauseVideo()
  }, [ready, music.isPlaying, music.awaitingUserGesture])

  /* Changing track is a request to hear it, so this never leaves the player
     paused. `loadVideoById` starts on its own, and `swapping` keeps the
     PAUSED it emits on the way from being written back into state. */
  useEffect(() => {
    if (!ready || music.videoId === loadedId.current) return
    loadedId.current = music.videoId
    swapping.current = true
    playerRef.current?.loadVideoById(music.videoId)
  }, [ready, music.videoId])

  const submitUrl = (e: FormEvent) => {
    e.preventDefault()
    // An empty submit is a stray Enter, not a mistake worth scolding.
    if (url.trim() === '') return
    const videoId = extractVideoId(url)
    if (videoId === null) {
      dispatch({ type: 'MUSIC_ERROR', message: PARSE_ERROR })
      return
    }
    dispatch({ type: 'LOAD_TRACK', videoId })
    setUrl('')
  }

  /* Everything the arrows step through: the shipped list, then whatever the
     visitor has added this session. Appending rather than replacing is what
     stops a pasted track being lost the moment they press next.

     Position is `music.videoId` itself, not an index kept alongside it. Two
     sources of truth for "which track" is exactly how a credit line ends up
     naming a different song than the one playing. */
  const playlist = [...DEFAULT_TRACKS.map((track) => track.videoId), ...pasted.map((t) => t.videoId)]
  const position = playlist.indexOf(music.videoId)

  const stepTrack = (delta: number) => {
    const count = playlist.length
    // -1 only in the gap before a new track registers, so start from the top.
    const to = position === -1 ? 0 : position + delta
    const next = playlist[((to % count) + count) % count]
    if (next === undefined) return
    dispatch({ type: 'LOAD_TRACK', videoId: next, isDefaultTrack: trackCredit(next) !== undefined })
  }

  /* The line under the widget. A shipped track carries the credit NCS's
     licence requires; a pasted one gets the title the player reports, which
     is the only thing known about it. */
  const credit = trackCredit(music.videoId)
  const yours = pasted.find((track) => track.videoId === music.videoId)
  const nowPlaying =
    credit !== undefined
      ? { text: `${credit.artist} - ${credit.title} [${credit.label}]`, url: credit.url }
      : yours === undefined
        ? undefined
        : {
            text: yours.title === '' ? yours.videoId : yours.title,
            url: `https://www.youtube.com/watch?v=${yours.videoId}`,
          }

  return (
    <div className="music-player">
      {/* The player itself is never seen; this is an audio feature. Kept in
          the layout at 1px rather than display:none, since a display:none
          iframe is a documented way to lose playback in some browsers. The
          iframe is appended into this div by the effect above. */}
      <div className="music-host" ref={hostRef} aria-hidden="true" />

      <div className="music-row">
        {/* Only worth rendering when there is somewhere to step to. */}
        {playlist.length > 1 && (
          <button
            className="music-btn pixel"
            onClick={() => stepTrack(-1)}
            aria-label="Previous track"
          >
            ◀◀
          </button>
        )}
        <button
          className="music-btn pixel"
          onClick={() => dispatch({ type: music.isPlaying ? 'PAUSE_MUSIC' : 'PLAY_MUSIC' })}
          aria-label={music.isPlaying ? 'Pause music' : 'Play music'}
        >
          {music.isPlaying ? '❚❚' : '▶'}
        </button>
        {playlist.length > 1 && (
          <button className="music-btn pixel" onClick={() => stepTrack(1)} aria-label="Next track">
            ▶▶
          </button>
        )}
        <button
          className="music-btn pixel"
          onClick={() => dispatch({ type: 'TOGGLE_MUTE' })}
          aria-label={music.isMuted ? 'Unmute' : 'Mute'}
          aria-pressed={music.isMuted}
        >
          {music.isMuted ? '🔇' : '🔈'}
        </button>
        <input
          className="music-volume"
          type="range"
          min={0}
          max={100}
          value={music.volume}
          aria-label="Volume"
          onChange={(e) => dispatch({ type: 'SET_VOLUME', volume: e.target.valueAsNumber })}
        />
        <span className="music-label pixel">
          {/* Position rather than a flat "DEFAULT TRACK", so the arrows read
              as a list you are moving through and not as a shuffle. */}
          {position === -1 ? 'YOUR PICK' : `TRACK ${position + 1}/${playlist.length}`}
        </span>
      </div>

      <form className="music-row" onSubmit={submitUrl}>
        <input
          className="music-url"
          type="text"
          value={url}
          placeholder="paste a youtube url"
          aria-label="YouTube URL"
          onChange={(e) => setUrl(e.target.value)}
        />
        <button className="music-btn pixel" type="submit">
          LOAD
        </button>
      </form>

      {/* Driven by the track actually loaded, not by `isDefaultTrack`: this
          has to name the song playing or it is worse than nothing. */}
      {nowPlaying !== undefined && (
        <p className="music-credit" title={nowPlaying.text}>
          <a href={nowPlaying.url} target="_blank" rel="noopener noreferrer">
            {nowPlaying.text}
          </a>
        </p>
      )}

      {music.awaitingUserGesture && (
        <p className="music-note">🔈 click anywhere to unmute</p>
      )}
      {music.lastError !== null && (
        <p className="music-note music-error" role="alert">
          {music.lastError}
        </p>
      )}
    </div>
  )
}
