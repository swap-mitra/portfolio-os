/* Hand-written ambient types for the YouTube IFrame Player API
   (architecture.md §8.1). Only the subset MusicPlayer actually calls is
   declared: there is no first-party @types package, and a fuller
   third-party one would be more surface to keep honest than we use. */

export interface YTPlayer {
  loadVideoById(videoId: string): void
  playVideo(): void
  pauseVideo(): void
  mute(): void
  unMute(): void
  setVolume(volume: number): void
  getPlayerState(): number
}

/** Numeric values of `YT.PlayerState`. Declared as plain consts in
    musicUtils.ts rather than read off the API object, so the reducer-facing
    logic doesn't need a live player to be readable. */
export interface YTPlayerEvent {
  target: YTPlayer
  data: number
}

export interface YTPlayerOptions {
  videoId: string
  playerVars?: Record<string, string | number>
  events?: {
    onReady?: (e: YTPlayerEvent) => void
    onStateChange?: (e: YTPlayerEvent) => void
    onError?: (e: YTPlayerEvent) => void
  }
}

export interface YTApi {
  Player: new (host: HTMLElement | string, options: YTPlayerOptions) => YTPlayer
}

declare global {
  interface Window {
    YT?: YTApi
    /** The API script calls this global once, when it has finished loading. */
    onYouTubeIframeAPIReady?: () => void
  }
}
