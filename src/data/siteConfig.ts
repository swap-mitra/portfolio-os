/* Site-wide constants (architecture.md §4). Only the music default lives here
   so far; the icon list, social links, and resume path arrive with Phase 6's
   apps rather than being scaffolded empty now. */

/** Track that plays on first load, before a visitor pastes their own URL.
    Currently "BADLANDS, A Synthwave Mix for Galactic Explorers".

    Embedding was verified against a real player, not assumed (architecture.md
    §8.5): the obvious pick, the Lofi Girl 24/7 stream `jfKfPfyJRdk`, returns
    **error 150, embedding disabled by the owner**, so it would have shipped
    as silence. Re-check with the same probe if this constant ever changes;
    it's a property of the upload, not of our code. */
export const DEFAULT_VIDEO_ID = '6aouLxiL4Cw'
