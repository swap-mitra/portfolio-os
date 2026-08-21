/* Site-wide constants (architecture.md §4). The music default and the
   contact links live here; the resume path arrives with SPIKE-25 rather than
   being scaffolded empty now. */

/** Track that plays on first load, before a visitor pastes their own URL.
    Currently "Cartoon - On & On (feat. Daniel Levi)", an NCS release, whose
    whole point is being free to use and spread.

    The previous default, `6aouLxiL4Cw`, began returning **error 150,
    embedding disallowed** and shipped as silence. Embeddability is a
    property of the upload and the owner can revoke it at any time, so this
    constant rots on its own.

    There is no way to check it from a script. Verified failing: the oEmbed
    endpoint returns 200 for a video with embedding disabled, and the watch
    page reports `"playableInEmbed":true` for one too, when fetched without
    a browser session. Only a real player at a real origin knows. So the
    check is: load the site, watch for the error, read the code the console
    logs (see MusicPlayer onError). */
export const DEFAULT_VIDEO_ID = 'K4DyBUG242c'

/** Contact details for the Contact window (SPIKE-26). Placeholders except
    the GitHub handle, which is this repo's own remote; project-spec.md §7
    has the owner supplying the real address and profiles before launch.

    No interface in types/content.ts: one consumer, so the literal's
    inferred shape is the type (same call as data/about.ts). */
export const contact = {
  email: 'you@example.com',
  profiles: [
    { label: 'GITHUB', url: 'https://github.com/swap-mitra' },
    { label: 'LINKEDIN', url: 'https://example.com/linkedin-placeholder' },
  ],
}

/** Served straight out of public/, so the path is absolute from the site
    root and identical in dev and production (SPIKE-25). */
export const RESUME_PATH = '/resume.pdf'
