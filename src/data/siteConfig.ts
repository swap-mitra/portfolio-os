/* Site-wide constants (architecture.md §4). The music default and the
   contact links live here; the resume path arrives with SPIKE-25 rather than
   being scaffolded empty now. */

/** Track that plays on first load, before a visitor pastes their own URL.
    "Cartoon - On & On (feat. Daniel Levi)", an NCS release, whose whole
    point is being free to use and spread.

    Embeddability is a property of the upload and the owner can revoke it at
    any time, so this constant rots on its own. Two IDs have already died
    here: `6aouLxiL4Cw`, and Kavinsky's "Nightcall" (`MV_3Dpw-BRY`), whose
    label allows the video on YouTube but not on other sites. Both report
    **error 150**. Don't swap in a reupload to get around that; the rights
    holder turned embedding off on purpose.

    No server-side probe can tell you which is which: the oEmbed endpoint
    returns 200 for a video with embedding disabled, and the watch page
    reports `"playableInEmbed":true` for one too when fetched without a
    browser session. Even `onReady` fires for a dead one. What separates
    them is playing the video in a real player at a real origin and then
    waiting: an unembeddable video reports a 0s duration and errors a moment
    after it says it's ready. This ID was checked that way, in headless
    Chrome against the dev server, and played 208s. */
export const DEFAULT_VIDEO_ID = 'K4DyBUG242c'

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
