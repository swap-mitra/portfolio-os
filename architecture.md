# Portfolio-OS — Architecture

Companion reference: `portfolio-os-mockup.html` (visual/interaction reference), `project-spec.md` (functional spec), `spikes.md` (spike-driven build plan). This document is the one to keep current — if a spike in `spikes.md` produces a finding that changes something below, update this file and note it in the spike's decision log.

## 0. Stack decision

**TypeScript-native, React + Vite, deployed on Vercel.** Every source file is `.ts`/`.tsx` — no `.js`/`.jsx` anywhere in `src/`. `strict: true` in `tsconfig.json` from day one, not retrofitted later.

Why this stack:
- **React** — the app is fundamentally a small window manager (several windows with independent open/closed/position/size/z-index state), which is exactly the kind of state React components handle cleanly.
- **Vite** — fast dev server, zero-config TypeScript support, and first-class Vercel support (Vercel auto-detects a Vite app and builds it correctly with no custom config required).
- **TypeScript, strict mode** — the OS state model (window state, music state, focus/z-index) has enough moving parts that catching mistakes at compile time is worth it, and it makes the codebase easier for an AI coding agent to work in safely (types are documentation the agent can't accidentally ignore).
- **Vercel** — zero-config static hosting for a Vite build, automatic preview deployments per branch/PR, no server needed since this is a fully static site.

## 1. Overview

A single-page personal portfolio site presented as a fictional retro desktop OS, arcade/8-bit visual style, neon-on-black palette, with a live animated background and background music. No backend, no database, no auth — a static site with all content baked in at build time; the only "dynamic" runtime behavior is client-side (window manager state, the YouTube player).

## 2. Component tree

```
App
├── BootScreen                    (plays once on load, then unmounts)
├── Desktop
│   ├── CityscapeBackground         (live animated neon city + moving car — see §7)
│   ├── Starfield                   (decorative twinkle layer, sits above the cityscape)
│   ├── ScanlineOverlay              (decorative CRT overlay, sits above everything else)
│   ├── DesktopIconGrid
│   │   └── DesktopIcon[]            (about, projects, resume, contact, terminal)
│   ├── WindowManager
│   │   └── Window[]                 (one per open app instance)
│   │       ├── TitleBar               (drag handle + min/max/close controls)
│   │       ├── <app content>          (AboutApp | ProjectsApp | ResumeApp | ContactApp | TerminalApp)
│   │       └── ResizeHandle
│   ├── StartMenu                    (conditionally rendered when open)
│   ├── MusicPlayer                  (persistent widget — see §8; not a Window, lives in the taskbar/corner)
│   └── Taskbar
│       ├── StartButton
│       ├── TaskbarTab[]              (one per open window)
│       └── Clock
```

## 3. State model

```ts
// src/types/os.ts

export type AppType = 'about' | 'projects' | 'resume' | 'contact' | 'terminal';

export interface WindowBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface WindowState extends WindowBounds {
  id: string;          // today always equals appType — see note below
  appType: AppType;
  zIndex: number;
  minimized: boolean;
  maximized: boolean;
  prevBounds?: WindowBounds; // restored on un-maximize
}

export interface MusicState {
  videoId: string;          // currently loaded YouTube video ID
  isDefaultTrack: boolean;  // true until the visitor supplies their own URL
  isPlaying: boolean;
  isMuted: boolean;
  volume: number;           // 0-100
  awaitingUserGesture: boolean; // true if autoplay-with-sound was blocked (see §8.3)
  lastError: string | null; // e.g. "Couldn't parse that URL"
}

export interface OSState {
  windows: Record<string, WindowState>;
  focusedWindowId: string | null;
  selectedIconId: AppType | null;
  startMenuOpen: boolean;
  shuttingDown: boolean;   // joke shutdown overlay (project-spec.md FR7)
  nextZIndex: number;      // incrementing counter for bring-to-front
  music: MusicState;
  reducedMotion: boolean;  // mirrors prefers-reduced-motion, read once + subscribed
}
```

Four changes from this doc's first draft, all made in SPIKE-03 and validated by a hand-built sample state in `src/types/os.test.ts`:

- **`WindowBounds` extracted as a named interface**, with `WindowState` extending it. `prevBounds`, the maximize/restore logic, and the move/resize action payloads all pass the same four numbers, so the shape earned a name.
- **`selectedIconId` narrowed from `string` to `AppType | null`.** The desktop has exactly one icon per app, so a wider type only permits typos that the compiler would otherwise catch.
- **`shuttingDown: boolean` added.** FR7's "Shut Down" joke overlay is real UI state and had no home in the original shape. It can't live inside `StartMenu` as local state, because picking the menu item closes the menu — the overlay has to outlive it.
- **`id` is documented as equal to `appType`.** The mockup opens at most one window per app (its taskbar tab toggles a single Projects window), so `OPEN_WINDOW` on an already-open app focuses the existing window rather than creating a duplicate. The field stays typed `string` so permitting multiple instances later needs no type change.

**Deliberately not added: a `windowOrder: string[]` field.** The taskbar needs a stable tab order that doesn't reshuffle on every focus change, which at first looks like it needs an explicit order array. It doesn't: JavaScript guarantees non-integer-like string keys iterate in insertion order, the window IDs are app names and so never integer-like, and assigning to an existing key preserves its original position — so a drag or a focus change can't reorder the tabs. A parallel array would be a second source of truth that can desync from `windows`. See SPIKE-03's decision log.

**Where it lives:** React Context + `useReducer` (`src/state/osReducer.ts` + `src/state/osContext.tsx`). No Redux/Zustand needed at this scope. `useOS()` returns `{ state, dispatch }` and throws if called outside `OSProvider`. `OSProvider` accepts an `initial` state override, used by tests and by persistence on load (SPIKE-05).

Reducer actions, as built in SPIKE-04: `OPEN_WINDOW`, `CLOSE_WINDOW`, `FOCUS_WINDOW`, `MOVE_WINDOW`, `RESIZE_WINDOW`, `MINIMIZE_WINDOW`, `RESTORE_WINDOW`, `TOGGLE_MAXIMIZE`, `SELECT_ICON`, `TOGGLE_START_MENU`, `CLOSE_START_MENU`, `SET_SHUTDOWN`, `LOAD_TRACK`, `MUSIC_ERROR`, `PLAY_MUSIC`, `PAUSE_MUSIC`, `SET_VOLUME`, `TOGGLE_MUTE`, `MUSIC_GESTURE_RESOLVED`, `SET_REDUCED_MOTION`.

Four differ from this doc's original list:

- **`RESTORE_WINDOW` added.** `MINIMIZE_WINDOW` is one-way, not a toggle — a minimized window isn't on screen, so its own title-bar button can never mean "restore". The taskbar tab is the only affordance that brings it back, and it has to both un-minimize *and* focus.
- **`CLOSE_START_MENU` added** alongside `TOGGLE_START_MENU`. The menu closes on outside-click and on `Escape`; with only a toggle, a document-level click handler would flip it back *open* on the second event. `CLOSE_START_MENU` returns the identical state object when already closed, so a repeatedly-firing handler causes no re-renders.
- **`SET_SHUTDOWN` added** to drive `shuttingDown`. Takes a boolean rather than being one-way, so Phase 3 can offer a way back out of the joke overlay without a type change; it also closes the Start Menu it was launched from.
- **`MUSIC_ERROR` added.** `MusicState.lastError` needed a way to be set. Deliberately leaves `videoId` and `isPlaying` untouched — a mistyped URL must not stop the track that's already playing. `LOAD_TRACK` clears it on success.

**`TOGGLE_MAXIMIZE` carries a `viewport: { width, height }` payload.** Maximized size depends on the window size, and the reducer stays pure — it never reads `window.innerWidth` itself. Same reasoning for why clamping a drag to the viewport lives in the drag hook (§5) rather than in `MOVE_WINDOW`.

**Persistence (optional):** mirror `windows` and `music.videoId`/`music.volume` to `localStorage` (`src/state/persistence.ts`) so a returning visitor's layout and last-picked track survive a refresh. Not required for launch.

## 4. Data layer

```
src/data/
  projects.ts        // Project[] — { id, title, description, link, repoUrl }
  siteConfig.ts       // icon list, start-menu structure, social links, resume file path, default YouTube video ID
  about.ts             // bio content
```

All typed (`src/types/content.ts` holds the shared interfaces). Editing the portfolio's content means editing these files and redeploying — no runtime data fetching.

## 5. Window manager mechanics

Unchanged in behavior from the mockup, implemented with typed hooks:

Sizing constants (`MIN_WIDTH`/`MIN_HEIGHT` 280/200, `DEFAULT_WIDTH`/`DEFAULT_HEIGHT` 420/330) are exported from `src/state/osReducer.ts` so the reducer and the resize hook cannot disagree about the floor.

- **Bring-to-front:** any `mousedown`/`pointerdown` on a window dispatches `FOCUS_WINDOW`, which sets `zIndex = nextZIndex++`. Re-focusing the already-focused window is a no-op that returns the identical state object, so holding the pointer down on the front window doesn't churn the counter or re-render.
- **`WindowManager` must establish its own stacking context** — `position: relative` with `z-index: var(--z-windows)` — and individual `WindowState.zIndex` values apply *inside* it. This is a hard requirement, not a style preference. `nextZIndex` increments on every focus change and is unbounded by design; SPIKE-04 measured it passing 500 after a few hundred focus changes, which as a page-level `z-index` would put windows above the scanline overlay (50), the music widget (55), the taskbar (60), and the Start Menu (70). Scoping them to a stacking context makes the growth harmless — the alternative, renumbering every window on each focus change, is more code and more churn for the same result.
- **New windows cascade.** Each additional window opens offset by 26px down-right (wrapping every 5) from the mockup's `250,90`. Without it, opening two apps stacks them exactly and looks broken; the mockup only ever shows one window so it never had to solve this.
- **One window per app.** `OPEN_WINDOW` for an already-open app focuses and un-minimizes the existing window instead of creating a second (see §3).
- **Focus never silently vanishes.** Closing or minimizing the focused window hands focus to the topmost remaining visible window, falling back to `null` only when nothing is left. Groundwork for SPIKE-28.
- **Drag:** `src/hooks/useDraggable.ts` — captures pointer offset on title-bar `pointerdown`, updates `x`/`y` on `pointermove`, clamps so the title bar can't leave the viewport, ends on `pointerup`. Use the Pointer Events API (not separate mouse/touch handlers) so drag works on touch devices too.
- **Resize:** `src/hooks/useResizable.ts` — same pattern from the corner handle, enforces `minWidth: 280, minHeight: 200`.
- **Minimize:** `minimized: true`; window unmounts visually, taskbar tab remains.
- **Maximize:** stores current bounds in `prevBounds`, snaps to an expanded-but-bounded size (not literal fullscreen — desktop stays visible behind it); toggling again restores `prevBounds`.
- **Close:** removes the `WindowState` entirely; re-opening creates a fresh one.

## 6. Design tokens

Reuse exactly what's in the mockup:

```css
--ink:      #0b0b16;
--ink-2:    #14142a;
--ink-3:    #1d1d3a;
--paper:    #e8e6f0;
--magenta:  #ff2e6b;
--cyan:     #23f0ff;
--yellow:   #ffe14d;
--green:    #39ff88;
```

- **Display/UI font:** `Press Start 2P` — titles/labels/buttons only.
- **Body font:** `VT323` — all readable content inside windows.
- **Font loading (decided in SPIKE-02):** Google Fonts `<link>` tags in `index.html`, matching the mockup exactly — two `preconnect` hints plus one stylesheet request with `display=swap`. Self-hosting via `@fontsource/*` is a possible later optimisation (see §14), not done now: two dependencies to remove two requests isn't worth it on a two-font site.
- Both families are also exposed as `--font-display` / `--font-body` in `tokens.css` so the literal font stack isn't repeated per component. The mockup's `.pixel` helper class is kept, since it's what the ported markup uses.
- `global.css` keeps the mockup's `-webkit-font-smoothing: none` — that's what stops the pixel fonts being antialiased into mush, so it isn't incidental.
- **Icons:** inline SVG, 10×10 unit viewBox, `shapeRendering="crispEdges"`, one flat color per icon.
- **Layer stack (z-index, back to front):** `CityscapeBackground` (0) → `Starfield` (5) → desktop icons (10) → `WindowManager` (20) → wordmark (40) → `ScanlineOverlay` (50) → `MusicPlayer` widget (55) → `Taskbar` (60) → `StartMenu` (70). These are the mockup's own values; the wordmark's 40 was implicit there and is written out here. All of them exist as `--z-*` custom properties in `tokens.css` — layering is a cross-component contract, so it shouldn't live as magic numbers spread across components.
- **Windows sit at 20 as a single layer, not "20+".** `WindowManager` owns z-index 20 and creates a stacking context; per-window `zIndex` values order windows *within* that layer only. The original "windows (20+, dynamic)" phrasing implied window z-indexes compete with the layers above them, which SPIKE-04 showed breaks after a few hundred focus changes — see §5.

## 7. Live background: neon cityscape

**Goal:** an animated, looping neon city skyline at night with a car driving through, in the mood of synthwave "night drive" visuals — built as original assets, not a re-hosted copyrighted video.

**Why not embed the reference video directly:** using someone else's copyrighted footage as a permanent, looping site background isn't something you have rights to do, and practically it's also a bad fit — long video files are heavy to load, hurt mobile performance and battery life, and you have no control if the source is ever taken down or embedding is disabled. Treat the reference purely as mood/pacing inspiration.

**Recommended approach — layered CSS/SVG parallax, no video file:**
- 3-4 flat SVG/CSS "layers" of building silhouettes at different scroll speeds (classic parallax), each layer a `<div>` with a repeating background pattern that scrolls horizontally via `transform: translateX()` in a `requestAnimationFrame` loop or a CSS `@keyframes` loop (CSS-only is cheaper on battery — prefer it unless you need per-frame logic).
- Windows lit in the building silhouettes as small rects in `--cyan`/`--magenta`/`--yellow`, some with a slow flicker (reuse the same flicker technique as the scanline overlay, offset per-window so they don't flicker in sync).
- A simple pixel-art car (same 10×10 crisp-SVG technique as the desktop icons) translating across the bottom of the scene on a loop, on its own fastest-moving parallax layer.
- A gradient sky (deep indigo to `--ink`) with the existing `Starfield` component layered on top.

**Alternative approach (heavier, consider only if the CSS/SVG version feels too flat):** a `<canvas>` render loop drawing the same elements procedurally. More flexible (e.g. easing the car's speed, adding headlight glow trails) but more code and more CPU — worth a spike (see `spikes.md` SPIKE-14) to decide before committing.

**Performance & battery:** this is the single biggest perf risk in the app. Must be tested on a real mid-range phone, not just desktop Chrome. Pause or simplify the animation (fewer layers, slower or stopped scroll) under `prefers-reduced-motion`, and consider pausing it entirely when the tab is backgrounded (`document.visibilitychange`).

## 8. Background music: YouTube-powered player

**Goal:** a track plays by default; visitors can paste any YouTube URL to swap in their own choice. This is implemented via the official **YouTube IFrame Player API** — the app never downloads, hosts, or extracts audio from YouTube itself, it only controls an embedded YouTube player, which is the only technically and legally sound way to do this in a client-only static site.

### 8.1 Loading the API

Load `https://www.youtube.com/iframe_api` once (script tag, `src/components/audio/MusicPlayer.tsx` injects it on mount if not already present), and wait for the global `onYouTubeIframeAPIReady` callback before constructing a `YT.Player` instance. Type the global via `src/types/youtube.d.ts` (there's no first-party `@types` package that's fully reliable for the IFrame API — a small hand-written ambient declaration for the subset of the API actually used is the pragmatic choice).

### 8.2 Parsing arbitrary YouTube URLs

`src/components/audio/musicUtils.ts` exports `extractVideoId(url: string): string | null`, handling at minimum:
- `https://www.youtube.com/watch?v=VIDEO_ID` (and with extra query params after)
- `https://youtu.be/VIDEO_ID`
- `https://www.youtube.com/embed/VIDEO_ID`
- `https://music.youtube.com/watch?v=VIDEO_ID`

Anything else sets `music.lastError` to a friendly message instead of throwing.

### 8.3 Autoplay policy (important constraint, not a bug to "fix")

Browsers block unmuted autoplay without a prior user gesture on the page. Practically:
- On load, attempt to start the default track **muted**, and show a small "🔈 tap to unmute — playing [track]" affordance on the `MusicPlayer` widget (`awaitingUserGesture: true` in state).
- The first click/tap/keypress anywhere on the page unmutes and starts real playback.
- This is standard behavior on essentially every site with background audio (YouTube itself does this) — spec this as expected UX, not an edge case to work around.

### 8.4 Player UI

`MusicPlayer` is a small persistent widget (not a `Window`) — play/pause, mute toggle, a volume slider, a text input for pasting a YouTube URL, and a label showing whether the current track is the default or a visitor's pick. Keep it visually consistent with the rest of the chrome (pixel font label, neon accent border) but small enough not to compete with the desktop.

### 8.5 A note on the default track

The feature works with any YouTube URL, including whichever one you set as the default in `siteConfig.ts`. Worth double-checking before launch that you're comfortable with that specific track being the first thing every visitor hears, and that its owner allows embedding (some uploaders disable it, which would silently break default playback) — swapping the constant is a one-line change if you change your mind later.

## 9. Apps breakdown

| App | Icon | Behavior |
|---|---|---|
| About Me | `about` | Bio text from `src/data/about.ts` |
| Projects | `projects` | Lists entries from `src/data/projects.ts`, each with title + description + external link |
| Resume | `resume` | Direct file download or an embedded-PDF preview + download button (decide in SPIKE-25) |
| Contact | `contact` | `mailto:` link + social links from `siteConfig.ts` |
| Terminal | `terminal` | Hardcoded command parser: `help`, `whoami`, `skills`, `projects`; optionally `play <youtube-url>` as a fun alternate way to change the track, wired into the same `LOAD_TRACK` action the `MusicPlayer` input uses |

## 10. Accessibility & responsiveness

- Icons and window controls keyboard-operable (`tabIndex`, `Enter`/`Space` to activate, visible focus rings).
- `Escape` closes the focused window or an open Start Menu.
- `prefers-reduced-motion` disables/simplifies: scanline flicker, starfield twinkle, and the cityscape's parallax scroll + car animation (freeze on a static frame rather than removing the art entirely).
- **Contrast: measured in SPIKE-02, and the palette is clear.** All 15 combinations of the five foreground tokens against the three dark backgrounds pass WCAG AA for body text (4.5:1). `--paper` on `--ink` is 15.84:1 and on `--ink-2` 14.62:1. `--magenta` on `--ink` — the pair most likely to fail — is 5.45:1, and the weakest pair overall (`--magenta` on `--ink-3`) is still 4.54:1. Reversed chrome text also passes: `--ink` on `--magenta` (title bar) 5.45:1, on `--yellow` (Start button) 15.02:1, on `--cyan` (selected icon label) 13.95:1. So no palette adjustment is needed, and keeping neon to short labels is a stylistic preference here rather than an accessibility requirement.
- Audio is never forced on unmuted without a gesture (§8.3), and the mute control must always be visible and reachable by keyboard — background music is a delight feature, not something that should trap or annoy anyone.
- **Mobile fallback:** below ~768px, tapping an icon opens its app fullscreen (one at a time, with a close/back control) instead of a floating window.

## 11. File structure

```
src/
  main.tsx
  App.tsx
  vite-env.d.ts
  components/
    BootScreen.tsx
    Desktop.tsx
    Taskbar.tsx
    StartMenu.tsx
    Window.tsx
    icons/
      PixelIcon.tsx
    background/
      CityscapeBackground.tsx
      Car.tsx
      Starfield.tsx
      ScanlineOverlay.tsx
    audio/
      MusicPlayer.tsx
      musicUtils.ts
    apps/
      AboutApp.tsx
      ProjectsApp.tsx
      ResumeApp.tsx
      ContactApp.tsx
      TerminalApp.tsx
      terminalCommands.ts
  hooks/
    useDraggable.ts
    useResizable.ts
    useClock.ts
    usePrefersReducedMotion.ts
  state/
    osReducer.ts
    osContext.tsx
    persistence.ts
  data/
    projects.ts
    siteConfig.ts
    about.ts
  types/
    os.ts
    content.ts
    youtube.d.ts
  styles/
    tokens.css
    crt-effects.css
    responsive.css
public/
  resume.pdf
tsconfig.json         (solution file — references the two below, holds no compiler options)
tsconfig.app.json     (compiles src/ — this is where the strictness flags live)
tsconfig.node.json    (compiles vite.config.ts)
vite.config.ts
package.json
.oxlintrc.json
vercel.json           (only if a custom config is actually needed — see §12)
```

Two notes from the SPIKE-00 scaffold that this list originally didn't anticipate:
- **The TypeScript config is split three ways**, which is what `create-vite` now produces. The root `tsconfig.json` is a solution file (`"files": []` plus project references) — compiler options placed there apply to nothing. `strict`, `noUncheckedIndexedAccess`, `noUnusedLocals`, and `noUnusedParameters` are set in `tsconfig.app.json` and `tsconfig.node.json`. The template ships *without* `strict`; it was added explicitly.
- `src/styles/global.css` also exists alongside the three stylesheets listed above (SPIKE-02 names it, this tree omitted it).

## 12. Deployment (Vercel via CI/CD)

Deployment runs entirely through a GitHub Actions pipeline (`.github/workflows/deploy.yml`) — nobody, human or agent, runs `vercel deploy` from a local/agent shell as part of normal work. The only manual, one-time step is creating the Vercel project itself (see below); everything after that is automatic on every push/PR.

- **Pipeline jobs:**
  - `build` — runs on every push and PR: install, type-check, lint, `vite build`. Fails the whole pipeline if any step fails — nothing gets attempted to deploy on a broken build.
  - `deploy-preview` — runs only on pull requests: builds and deploys to a Vercel preview environment, then comments the resulting URL on the PR. This is what you use to review the cityscape/music features on an actual mobile device before merging, not just desktop.
  - `deploy-production` — runs only on pushes to `main`: same pattern, deployed with `--prod`.
- **One-time manual setup (cannot be automated by an agent):** the repo owner runs `vercel link` from their own machine (interactive login required) to create the Vercel project, then adds `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID` as GitHub Actions repository secrets. Until this is done, the `build` job still runs and catches type/lint/build errors — only the two deploy jobs are blocked.
  - **Status as of SPIKE-01: still outstanding.** The three secrets do not exist on the repo, so `deploy-preview` and `deploy-production` have never successfully run. The deploy jobs are intentionally *not* guarded with an `if: secrets… != ''` skip condition, so **every push to `main` shows a failed run** until the secrets are added — a visible reminder rather than a silently-skipped step. No workflow change is needed once they exist.
- **Type-check command:** `npm run type-check` → **`tsc -b`**, not `tsc --noEmit`. With the split tsconfig (§11), `tsc --noEmit` at the repo root checks *zero* files — verified in SPIKE-00 with `tsc --noEmit --listFiles`, which listed nothing. `tsc -b` builds both referenced projects, and because both set `noEmit: true` it type-checks without emitting.
- **Lint command:** `npm run lint` → **`oxlint`** (configured by `.oxlintrc.json`), not `eslint .`. This is what `create-vite` scaffolds as of Vite 8; it was kept rather than replaced with `typescript-eslint`. SPIKE-31 should revisit only if a genuinely type-aware lint rule is needed.
- **Build command (inside the pipeline):** `npm run build`, which runs `tsc -b && vite build` — type-check before bundling.
- **Output directory:** `dist`.
- **Node version:** pinned in the workflow's `setup-node` step (Node 20) and mirrored in `package.json` as `"engines": { "node": "^20.19.0 || >=22.12.0" }` — copied from Vite 8's and oxlint's own declared ranges. The original `>=20` here was too loose: Vite 8 will not run on Node 20.0–20.18. `node-version: 20` in the workflow resolves to the latest 20.x, which clears the floor.
- **Environment variables at runtime:** none required in the built app itself — everything is static/client-side, including the YouTube integration (no API key needed for the IFrame Player API). The `VERCEL_*` secrets are deploy-time only, used by the Actions runner, and never bundled into the shipped site.
- **Only add a custom `vercel.json`** if you need something the default `vercel build` doesn't infer automatically (e.g. custom cache headers for `public/resume.pdf`, or SPA rewrite rules if client-side routing is ever added — not needed for the current single-page, no-router design).

The full starting-point workflow YAML lives in `spikes.md` SPIKE-01 — treat that as the source of truth for the actual job definitions, and update it there (not just here) if the pipeline structure changes.

## 13. QA checklist before launch

- Drag/resize/minimize/maximize/close all behave correctly across Chrome, Firefox, Safari.
- Mobile fallback view is usable on a real phone, not just a resized desktop browser.
- Keyboard-only navigation can reach and operate every icon, window control, and Start Menu item.
- `prefers-reduced-motion` disables/simplifies the scanlines, starfield, and cityscape/car animation.
- Cityscape animation holds a reasonable frame rate on a mid-range phone and doesn't drain battery unreasonably — profile it, don't assume.
- Default music track loads, the muted-autoplay → unmute-on-gesture flow works, and pasting a custom YouTube URL correctly swaps the track (including invalid-URL error handling).
- Resume file downloads/opens correctly.
- `tsc --noEmit` and lint pass clean; no `any` types left in for convenience.
- Production build on Vercel matches local dev in behavior (test the actual preview URL, not just `localhost`).
- Run a Lighthouse pass for performance and accessibility.

## 14. Optional future extensions (non-blocking)

- Retro sound effects (coin blip on click, boot chime) layered alongside the music player, with the same mute toggle covering both.
- A boot sequence animation before the desktop first appears.
- A theme switcher for alternate neon palettes.
- A "guestbook" or visitor counter as a nostalgic easter egg.
- Self-hosting the two fonts via `@fontsource/press-start-2p` + `@fontsource/vt323` instead of the Google Fonts CDN (removes two third-party requests and works offline in dev — see §6; only worth it if SPIKE-32's Lighthouse pass shows the fonts hurting LCP).
