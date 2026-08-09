# Portfolio-OS

A personal portfolio presented as a fictional retro desktop operating system — neon-on-black
arcade styling, draggable windows, an animated cityscape background, and background music.

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
| 4 — Live background | Not started |
| 5 — Music player | Not started |
| 6 — Apps (About/Projects/Resume/Contact/Terminal) | Not started |
| 7 — Accessibility | Not started |
| 8 — Quality & release | Not started |

`src/App.tsx` now plays the boot sequence once, then mounts the real `Desktop` (icons, Start
Menu, windows, taskbar). Live background, music, and real app content still land in Phases 4-6.

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
