# Project Specification — Portfolio-OS

**Purpose of this document:** this is a build spec intended to be handed to an AI coding agent (Claude Code, Cursor, etc.) to implement the project end-to-end. Read alongside `architecture.md` (technical structure, TypeScript-native) and `spikes.md` (spike-driven build plan), and `portfolio-os-mockup.html` (approved visual/interaction reference for the desktop shell — treat its look and behavior as ground truth for styling and window interaction).

## 1. Project summary

A personal portfolio website presented as a fictional desktop operating system, styled in a retro arcade/8-bit visual language with a neon-on-black palette, a live animated neon-cityscape background, and background music. Visitors explore the site by clicking desktop icons that open draggable, resizable windows, the same way they'd use a real OS, rather than scrolling a conventional resume page.

## 2. Goals / success criteria

- A visitor can, entirely through the desktop metaphor: read an about-me/bio, browse projects, download the resume/CV, and find contact details.
- The experience feels playful and memorable, atmospheric (moving city + music), without sacrificing basic usability for someone who just wants the CV quickly.
- Fully working and polished on desktop browsers. Mobile gets a simplified but complete fallback (§6, FR11) — not a broken or cut-down experience.
- Deploys to Vercel automatically via a GitHub Actions CI/CD pipeline on every push/PR, with zero custom server infrastructure.

## 3. Non-goals / out of scope

- No backend, database, or CMS.
- No user accounts, login, or personalization beyond the current browser session.
- No real multiplayer, chat, or persistence beyond `localStorage`, unless the site owner explicitly requests it later.
- No literal Windows/macOS/Linux branding or copied assets — the OS aesthetic is original and generic.
- No re-hosting, downloading, or extracting audio/video from YouTube — the music feature only controls an embedded official YouTube player.
- No server-side proxy or API key for the YouTube integration — the IFrame Player API works entirely client-side.

## 4. Target audience

Recruiters, hiring managers, and potential collaborators or clients viewing the portfolio, likely on both desktop and mobile.

## 5. Visual design spec

Use the tokens and interaction feel established in `portfolio-os-mockup.html` exactly for the desktop shell — do not reinterpret the palette or type choices.

- **Colors:** `--ink #0b0b16`, `--ink-2 #14142a`, `--ink-3 #1d1d3a`, `--paper #e8e6f0`, `--magenta #ff2e6b`, `--cyan #23f0ff`, `--yellow #ffe14d`, `--green #39ff88`.
- **Fonts:** `Press Start 2P` for titles/labels/buttons (sparingly — never body paragraphs), `VT323` for readable body text inside windows.
- **Icons:** flat-color pixel-art SVGs (10×10 grid, crisp edges), one per app — no photos, no emoji, no stock icon packs.
- **Background:** a live, looping, original (not re-hosted footage) animated neon cityscape with a car driving through it, in the mood of synthwave "night drive" visuals — see `architecture.md` §7 for the implementation approach.
- **Texture:** scanline overlay, slow flicker, sparse twinkling starfield layered above the cityscape — all decorative, all disabled or simplified under `prefers-reduced-motion`.
- **Window chrome:** magenta title bar, dark window body, pixel-style min/max/close buttons, cyan resize handle.
- **Taskbar:** dark bar with a glowing cyan top border, pulsing yellow Start button, active-window tabs, live clock.
- **Music player:** a small persistent widget (not a window), visually consistent with the rest of the chrome.

## 6. Functional requirements

| ID | Requirement |
|---|---|
| FR1 | Desktop displays icons for: About Me, Projects, Resume, Contact, Terminal. |
| FR2 | Clicking an icon selects/highlights it; activating it (click, or Enter/Space when focused) opens its window. |
| FR3 | Windows are draggable via the title bar and resizable via a bottom-right handle, with sane minimum dimensions. |
| FR4 | Multiple windows can be open simultaneously; clicking a window brings it to front (z-index). |
| FR5 | Each window supports minimize, maximize, and close, per `architecture.md` §5. |
| FR6 | The taskbar shows one tab per open window (click to restore/focus) and a live clock. |
| FR7 | The Start button opens a Start Menu with entries for Programs (the apps), Documents (Resume), and a "Shut Down" option that shows a joke shutdown screen. |
| FR8 | The Resume icon downloads or opens the actual CV file (decide preview-then-download vs. direct download in build). |
| FR9 | The Contact app shows a `mailto:` link and links to the owner's real social/professional profiles. |
| FR10 | The Terminal app supports hardcoded commands (`help`, `whoami`, `skills`, `projects`), returning canned text; unrecognized commands show a friendly "command not found" message. |
| FR11 | Below a mobile breakpoint, tapping an icon opens its app fullscreen (one at a time, with a close/back control) instead of a floating draggable window. |
| FR12 | The desktop background is a live, animated neon cityscape with a car driving through it, looping continuously, built as original animated assets (CSS/SVG or Canvas — see `architecture.md` §7), not an embedded copyrighted video. |
| FR13 | Background music plays by default (a configured default track), using the YouTube IFrame Player API. On load, the default track attempts muted autoplay; the first user interaction unmutes and starts real playback (see `architecture.md` §8.3 — this is a browser policy constraint, not optional behavior to design around). |
| FR14 | Visitors can paste any YouTube URL into the music player to swap in their own choice of track, with friendly error handling for invalid/unparseable URLs. |
| FR15 | The music player exposes play/pause, mute, and volume controls, always visible and keyboard-reachable. |

## 7. Content requirements

The following real content must be supplied by the site owner before launch — build the site to consume it from the typed data files described in `architecture.md` §4, not hardcoded inline:

- Real bio/about-me text.
- Real project list: title, one-line description, link, and (optional) repo link, for each project.
- Real resume/CV file.
- Real contact links (email, LinkedIn, GitHub, etc.).
- Confirmed default YouTube video ID for background music (owner should confirm the track allows embedding and that they're comfortable with it autoplaying by default).

Until supplied, use clearly-labeled placeholder content (e.g. the three placeholder projects from the mockup) so the site remains demoable.

## 8. Technical requirements

- **Language:** TypeScript, strict mode, no `.js`/`.jsx` files in `src/`.
- **Stack:** React + Vite. No CSS framework, no UI component library, no backend.
- **Output:** a static single-page app, deployed to **Vercel** via a GitHub Actions CI/CD pipeline (zero-config Vite build). Vercel credentials are stored as GitHub Actions repository secrets and used only at deploy time — never run from a local or agent shell, never bundled into the shipped app.
- **Browser support:** current Chrome, Firefox, Safari, Edge. No IE support needed.
- **YouTube integration:** official IFrame Player API only, loaded client-side, no API key.

## 9. Accessibility requirements

- Every icon and window control must be reachable and operable by keyboard, with visible focus states.
- `Escape` closes the focused window or an open Start Menu.
- `prefers-reduced-motion` disables or simplifies all decorative animation: scanline flicker, starfield twinkle, and the cityscape's parallax/car motion.
- Body text must pass WCAG AA contrast against its background; reserve the brightest neon colors for short labels/accents rather than long text blocks.
- Audio is never forced on unmuted without a user gesture, and mute/pause controls are always visible and keyboard-operable.

## 10. Deliverables

- A fully working, responsive site matching this spec and the reference mockup, deployed and verified on Vercel via the CI/CD pipeline (including a tested PR preview deployment and a tested production deployment).
- A README with local dev setup and Vercel deploy instructions.
- Clean, componentized, fully-typed, commented code following the structure in `architecture.md` §11.

## 11. Reference materials provided

- `portfolio-os-mockup.html` — visual and interaction reference for the desktop shell (open it directly in a browser).
- `architecture.md` — technical architecture, state model, and file structure (TypeScript-native, Vercel deployment).
- `spikes.md` — the spike-driven development plan; work through spikes in order, updating `architecture.md` when a spike's findings change an assumption.

## 12. Open questions to resolve before or during the build

- Final real project list, descriptions, and links.
- Final resume/CV file.
- Final contact links.
- Confirmed default YouTube video ID for background music, and confirmation that embedding is allowed for that video.
- Whether to add retro sound effects (coin blip, boot chime) alongside the music player, sharing its mute control.
- Whether to add a boot sequence animation before the desktop first appears.
- Final choice between the CSS/SVG parallax cityscape and the canvas-based alternative (see `spikes.md` SPIKE-14).
