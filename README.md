# Portfolio-OS

A personal portfolio presented as a fictional retro desktop operating system — neon-on-black
arcade styling, draggable windows, an endless synthwave drive for a background, and background
music.

Static single-page app: React + Vite + TypeScript, no backend, no database.

Planning docs live in `specs/` (gitignored — local reference only, not part of the shipped app):

- `specs/project-spec.md` — what's being built and why (functional spec)
- `specs/architecture.md` — technical architecture, state model, file structure
- `specs/spikes.md` — the spike-driven build plan, with a decision log per spike
- `specs/portfolio-os-mockup.html` — approved visual/interaction reference; open it in a browser

## Progress

| Phase | Status |
|---|---|
| 0 — Foundations (scaffold, CI/CD, design tokens) | Done |
| 1 — Core OS state & types | Done |
| 2 — Window manager (drag, resize, focus/z-index, minimize/maximize/close, taskbar sync) | Done |
| 3 — Desktop shell (icons, Start Menu, taskbar chrome, boot screen) | Done |
| 4 — Live background (drive scene, scanlines, reduced motion) | Done |
| 5 — Music player | Done |
| 6 — Apps (About/Projects/Resume/Contact/Terminal) | Done |
| 7 — Accessibility & responsiveness | Done |
| 8 — Quality & release | Not started |

`src/App.tsx` plays the boot sequence once, then mounts the real `Desktop`: animated neon
drive scene, CRT scanlines, icons, Start Menu, windows, taskbar, and the music widget.

All five windows render real content. About and Projects read their copy from `src/data/`,
Contact reads `siteConfig.ts`, Resume previews `public/resume.pdf` inline with a download button
beside it, and Terminal runs a small hardcoded command set (`help`, `whoami`, `skills`,
`projects`, and `play <youtube-url>`, which swaps the background track through the same action
the music widget's URL box dispatches).

The copy is real, not placeholder. Bio and skills live in `src/data/about.ts`, the project list
in `src/data/projects.ts`, email and profile links in `src/data/siteConfig.ts`, and the resume is
`public/resume.pdf`. Nothing else needs touching to update any of it.

The background is a canvas scene drawn per frame: gradient sky, banded sun, mountain ridges, a
perspective grid, and a road that scrolls towards you. Every frame is a pure function of elapsed
seconds, which is what makes `prefers-reduced-motion` a one-liner (draw frame zero, never
schedule another) and keeps two machines at different frame rates on the same stretch of road.
It stops in a backgrounded tab because `requestAnimationFrame` already does. Measured at 15ms
median frame time under 4x CPU throttling at 1280x800, and 5.1ms at phone size.

It replaced a CSS/SVG parallax cityscape, which is still in the history if it is ever wanted
back.

Music is the official YouTube IFrame Player API: the site controls an embedded player, it never
downloads or hosts audio. A default track autoplays **muted** (browsers block unmuted autoplay
without a gesture), and the first click or keypress anywhere on the page unmutes it. Visitors can
paste any YouTube URL to swap the track; volume, mute, and the chosen track persist to
`localStorage`, window layout deliberately does not. The default track lives in
`src/data/siteConfig.ts` and must be one whose uploader allows embedding.

Below 768px an app opens fullscreen instead of as a floating window, with drag and resize
handlers detached rather than just restyled, and close as the only control. The breakpoint lives
in two places that must agree: `src/hooks/useIsMobile.ts` decides which handlers attach,
`src/styles/responsive.css` decides what it looks like.

Three exit criteria across the phases so far are **not** met, all for want of hardware:

- the background has not been profiled on a physical mid-range phone, only under 4x CPU
  throttling at a phone-sized viewport (`specs/spikes.md` SPIKE-17);
- the autoplay/unmute flow is verified in Chrome only, not Firefox or Safari (SPIKE-20);
- the mobile layout is verified against emulated devices and across the breakpoint, but not on a
  real phone, so touch target sizes and viewport quirks (safe areas, address bar show/hide) are
  unchecked (SPIKE-30).

## Local development

Requires Node `^20.19.0 || >=22.12.0` (Vite 8's floor — Node 20.0–20.18 will not work).

```bash
npm install
npm run dev        # dev server at http://localhost:3000
```

| Script | What it does |
|---|---|
| `npm run dev` | Vite dev server with HMR |
| `npm run build` | `tsc -b && vite build` → static output in `dist/` |
| `npm run type-check` | `tsc -b` — type-checks `src/` and `vite.config.ts` |
| `npm run lint` | `oxlint` |
| `npm run preview` | Serve the production build locally |

**Note on `type-check`:** it runs `tsc -b`, not `tsc --noEmit`. The TypeScript config is split
into a root solution file plus `tsconfig.app.json` / `tsconfig.node.json`; `tsc --noEmit` at the
root type-checks *zero* files, so it would pass unconditionally. Both referenced configs set
`noEmit: true`, so `tsc -b` checks types without writing output.

## Deployment (Vercel via GitHub Actions)

Deploys run **only** through `.github/workflows/deploy.yml`. Nobody — human or agent — runs
`vercel deploy` from a local shell as part of normal work.

| Trigger | Jobs that run | Result |
|---|---|---|
| Any push or PR to `main` | `build` | Type-check, lint, and production build must all pass |
| Pull request to `main` | `build` → `deploy-preview` | Vercel preview deploy; the URL is posted as a PR comment |
| Push to `main` | `build` → `deploy-production` | Vercel production deploy (`--prod`) |

`build` is the gate: both deploy jobs `needs: build`, so a type error or lint failure means
nothing is deployed.

### One-time setup (repo owner only — cannot be automated)

The two deploy jobs need three GitHub Actions repository secrets. **They are not set yet, so
preview and production deploys currently do not run.** The `build` job does not depend on them
and works regardless.

To enable deploys:

1. From your own machine, in this repo: `npx vercel link` — this requires an interactive
   Vercel login, which is why it can't be scripted. It creates the Vercel project and writes
   `.vercel/project.json` containing `orgId` and `projectId`.
2. Create a token at <https://vercel.com/account/tokens>.
3. Add all three under **repo → Settings → Secrets and variables → Actions**:

   | Secret | Where it comes from |
   |---|---|
   | `VERCEL_TOKEN` | vercel.com/account/tokens |
   | `VERCEL_ORG_ID` | `orgId` in `.vercel/project.json` (or Vercel project → Settings → General) |
   | `VERCEL_PROJECT_ID` | `projectId` in the same place |

4. Verify end to end: open a throwaway PR and confirm `deploy-preview` comments a working
   preview URL, then merge it and confirm the production URL updates. Open both URLs — a green
   check on the Action is not proof the site works.

That is the whole list. Nothing else is required on the Vercel side, and no repo settings need
changing: `deploy-preview` carries its own `permissions: { contents: read, pull-requests: write }`
block so it can post the PR comment despite the repo's read-only default `GITHUB_TOKEN`.

The Vercel CLI is pinned to `npx vercel@58` so a future major release can't break deploys without
a visible change here. Note the build actually runs **on the GitHub runner** (`vercel build` +
`vercel deploy --prebuilt`), not on Vercel's build infrastructure — so the runner's Node version,
not the Vercel project's, is what builds the site.

`.vercel/` is gitignored. No Vercel credentials belong in the repo or in `.env.local` — they are
deploy-time only, used by the Actions runner, and never bundled into the shipped site.

### Runtime environment variables

None. The app is fully static and client-side, including the YouTube IFrame Player API
integration, which needs no API key.
