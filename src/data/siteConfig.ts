/* Site-wide constants (architecture.md §4). The music default and the
   contact links live here; the resume path arrives with SPIKE-25 rather than
   being scaffolded empty now. */

export interface DefaultTrack {
  /** YouTube video ID, verified embeddable by the method described below. */
  videoId: string
  artist: string
  title: string
  label: string
  /** The original upload. NCS's licence requires linking back to it. */
  url: string
}

/* The tracks shipped with the site, in the order the widget steps through
   them. A visitor can still paste any URL; this is the list they get for
   free, and every entry has to clear the same two bars.

   **Licensing.** NCS licenses its catalogue for free use on the condition
   that you credit the artist, the track, and NCS, and link back to the
   original upload. That grant is what makes it legitimate to autoplay these
   on a site that isn't NCS. A commercial release carries no such grant, so
   it does not go in this list however well it fits the aesthetic. Kavinsky's
   "Nightcall" was tried and refused by its label at the embed level, which
   is the same answer in machine-readable form.

   **Embeddability.** A property of the upload, revocable by the owner at any
   time, so this list rots on its own. Two IDs have already died here:
   `6aouLxiL4Cw`, and Nightcall (`MV_3Dpw-BRY`), whose label allows the video
   on YouTube but not on other sites. Both report **error 150**. Don't swap
   in a reupload or a self-hosted rip to get around that; the rights holder
   turned embedding off on purpose.

   No server-side probe can tell you which is which: the oEmbed endpoint
   returns 200 for a video with embedding disabled, and the watch page
   reports `"playableInEmbed":true` for one too when fetched without a
   browser session. Even `onReady` fires for a dead one. What separates them
   is playing the video in a real player at a real origin and then waiting:
   an unembeddable video reports a 0s duration and errors a moment after it
   says it's ready. Both entries below were checked that way, in headless
   Chrome against the dev server, and played 238s and 265s. Anything added
   here gets the same check before it ships. */

const PHOENIX: DefaultTrack = {
  videoId: 'yH88qRmgkGI',
  artist: 'Netrum & Halvorsen',
  title: 'Phoenix',
  label: 'NCS',
  url: 'https://www.youtube.com/watch?v=yH88qRmgkGI',
}

const RED_LINE: DefaultTrack = {
  videoId: 'VrDD2GSNs_I',
  artist: 'Anna Yvette',
  title: 'Red Line',
  label: 'NCS',
  url: 'https://www.youtube.com/watch?v=VrDD2GSNs_I',
}

export const DEFAULT_TRACKS: DefaultTrack[] = [PHOENIX, RED_LINE]

/** What plays on first load. Named separately from the list because it is
    the one the site opens with, and because persistence.ts documents it. */
export const DEFAULT_VIDEO_ID = PHOENIX.videoId

/** The credit for a track the site ships, or undefined for one the visitor
    pasted. Theirs gets no credit line, because nothing is known about it. */
export function trackCredit(videoId: string): DefaultTrack | undefined {
  return DEFAULT_TRACKS.find((track) => track.videoId === videoId)
}

/** Contact details for the Contact window (SPIKE-26). The phone number on
    the resume is deliberately not here: the PDF is a deliberate hand-off, a
    contact page is a scraper target.

    No interface in types/content.ts: one consumer, so the literal's
    inferred shape is the type (same call as data/about.ts). */
export const contact = {
  email: 'swpnlmitra@gmail.com',
  profiles: [
    { label: 'GITHUB', url: 'https://github.com/swap-mitra' },
    { label: 'LINKEDIN', url: 'https://www.linkedin.com/in/swapnilmitra/' },
  ],
}

/** Served straight out of public/, so the path is absolute from the site
    root and identical in dev and production (SPIKE-25). */
export const RESUME_PATH = '/swapnil_mitra_cv.pdf'
