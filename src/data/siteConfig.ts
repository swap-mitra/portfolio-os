/* Site-wide constants (architecture.md §4). The music default and the
   contact links live here; the resume path arrives with SPIKE-25 rather than
   being scaffolded empty now. */

/** Track that plays on first load, before a visitor pastes their own URL.
    Currently "BADLANDS, A Synthwave Mix for Galactic Explorers".

    Embedding was verified against a real player, not assumed (architecture.md
    §8.5): the obvious pick, the Lofi Girl 24/7 stream `jfKfPfyJRdk`, returns
    **error 150, embedding disabled by the owner**, so it would have shipped
    as silence. Re-check with the same probe if this constant ever changes;
    it's a property of the upload, not of our code. */
export const DEFAULT_VIDEO_ID = '6aouLxiL4Cw'

/** Contact details for the Contact window (SPIKE-26). Placeholders except
    the GitHub handle, which is this repo's own remote; project-spec.md §7
    has the owner supplying the real address and profiles before launch.

    No interface in types/content.ts — one consumer, so the literal's
    inferred shape is the type (same call as data/about.ts). */
export const contact = {
  email: 'you@example.com',
  profiles: [
    { label: 'GITHUB', url: 'https://github.com/swap-mitra' },
    { label: 'LINKEDIN', url: 'https://example.com/linkedin-placeholder' },
  ],
}
