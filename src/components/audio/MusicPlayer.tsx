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
import { DEFAULT_TRACK_CREDIT, DEFAULT_VIDEO_ID } from '../../data/siteConfig'
import { ENDED, PARSE_ERROR, PAUSED, PLAYING, extractVideoId, playerErrorMessage } from './musicUtils'
import type { YTApi, YTPlayer } from '../../types/youtube'

const API_SRC = 'https://www.youtube.com/iframe_api'

/* Module-level, not per-component: the script may only be injected once, and
   the API's ready callback is a single global. A promise makes both the
   "already loaded" and "loading right now" cases fall out for free, which is
   what makes StrictMode's double-mount harmless (architecture.md §8.1). */
let apiPromise: Promise<YTApi> | undefined

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
  const [ready, setReady] = useState(false)
  const [url, setUrl] = useState('')

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
        playerVars: { autoplay: 1, controls: 0, playsinline: 1, disablekb: 1 },
        events: {
          onReady: (e) => {
            /* Muted first, always: unmuted autoplay without a gesture is
               blocked everywhere, and a blocked play() means no playback at
               all rather than silent playback (§8.3). */
            e.target.mute()
            e.target.setVolume(music.volume)
            e.target.playVideo()
            setReady(true)
          },
          onStateChange: (e) => {
            if (e.data === PLAYING) dispatch({ type: 'PLAY_MUSIC' })
            else if (e.data === PAUSED) dispatch({ type: 'PAUSE_MUSIC' })
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
    // Deliberately not depending on music.volume: it's read once here to seed
    // the player, has its own sync effect below, and listing it would rebuild
    // the player on every drag of the slider.
  }, [music.videoId, dispatch])

  /* First interaction anywhere on the page unmutes (§8.3). Deliberately on
     document, not the widget: most visitors' first click is a desktop icon. */
  useEffect(() => {
    if (!music.awaitingUserGesture) return

    const resolve = () => dispatch({ type: 'MUSIC_GESTURE_RESOLVED' })
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

  useEffect(() => {
    if (!ready) return
    if (music.isPlaying) playerRef.current?.playVideo()
    else playerRef.current?.pauseVideo()
  }, [ready, music.isPlaying])

  useEffect(() => {
    if (!ready || music.videoId === loadedId.current) return
    loadedId.current = music.videoId
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

  return (
    <div className="music-player">
      {/* The player itself is never seen; this is an audio feature. Kept in
          the layout at 1px rather than display:none, since a display:none
          iframe is a documented way to lose playback in some browsers. The
          iframe is appended into this div by the effect above. */}
      <div className="music-host" ref={hostRef} aria-hidden="true" />

      <div className="music-row">
        <button
          className="music-btn pixel"
          onClick={() => dispatch({ type: music.isPlaying ? 'PAUSE_MUSIC' : 'PLAY_MUSIC' })}
          aria-label={music.isPlaying ? 'Pause music' : 'Play music'}
        >
          {music.isPlaying ? '❚❚' : '▶'}
        </button>
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
          {music.isDefaultTrack ? 'DEFAULT TRACK' : 'YOUR PICK'}
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

      {music.isDefaultTrack && (
        <p className="music-credit">
          <a href={DEFAULT_TRACK_CREDIT.url} target="_blank" rel="noopener noreferrer">
            {DEFAULT_TRACK_CREDIT.artist} - {DEFAULT_TRACK_CREDIT.title} [
            {DEFAULT_TRACK_CREDIT.label}]
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
