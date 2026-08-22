/* Site-wide constants (architecture.md §4). The music default and the
   contact links live here; the resume path arrives with SPIKE-25 rather than
   being scaffolded empty now. */

/** Track that plays on first load, before a visitor pastes their own URL.
    "Netrum & Halvorsen - Phoenix", an NCS release: synthwave, instrumental,
    and licensed for exactly this use. Instrumental on purpose, since a
    vocal track competes with reading the windows.

    Alternative, verified the same way: `VrDD2GSNs_I` (Anna Yvette - Red
    Line, 265s, has vocals). Swapping is this one line.

    Embeddability is a property of the upload and the owner can revoke it at
    any time, so this constant rots on its own. Two IDs have already died
    here: `6aouLxiL4Cw`, and Kavinsky's "Nightcall" (`MV_3Dpw-BRY`), whose
    label allows the video on YouTube but not on other sites. Both report
    **error 150**. Don't swap in a reupload or a self-hosted rip to get
    around that; the rights holder turned embedding off on purpose.

    No server-side probe can tell you which is which: the oEmbed endpoint
    returns 200 for a video with embedding disabled, and the watch page
    reports `"playableInEmbed":true` for one too when fetched without a
    browser session. Even `onReady` fires for a dead one. What separates
    them is playing the video in a real player at a real origin and then
    waiting: an unembeddable video reports a 0s duration and errors a moment
    after it says it's ready. This ID was checked that way, in headless
    Chrome against the dev server, and played 238s. */
export const DEFAULT_VIDEO_ID = 'yH88qRmgkGI'

/** Attribution for the default track, shown while it is the one playing.

    Not decoration: NCS licenses its catalogue for free use on the condition
    that you credit the artist, the track, and NCS, and link back to the
    original upload. The widget said only "DEFAULT TRACK" before, which met
    none of that, and the default was already an NCS release. A visitor's own
    pasted track gets no credit line, because we know nothing about it. */
export const DEFAULT_TRACK_CREDIT = {
  artist: 'Netrum & Halvorsen',
  title: 'Phoenix',
  label: 'NCS',
  url: 'https://www.youtube.com/watch?v=yH88qRmgkGI',
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
export const RESUME_PATH = '/resume.pdf'
