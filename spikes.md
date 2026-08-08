# Spikes — Portfolio-OS (Spike-Driven Development)

## How to use this document

A **spike** is a small, time-boxed piece of exploratory work done *before* committing to a final implementation of something uncertain — it exists to answer a specific question, not to ship polished code. Some spikes here will produce throwaway code; others will produce the actual first working version of a component. Each spike says which you should expect.

Work through spikes roughly in phase order — later phases assume earlier ones are done, since e.g. the window manager (Phase 2) depends on the state types from Phase 1. Within a phase, order is flexible.

**Every spike ends the same way:** fill in its Decision log before moving on. If what you found changes an assumption written in `architecture.md`, update that section of `architecture.md` in the same commit as the spike — don't let the docs drift from what actually got built. The "Architecture.md impact" line in each spike tells you which section to check.

**Format of each entry:**
- **Paths** — exact files this spike touches
- **Objective** — the one question this spike answers
- **Time-box** — a ceiling, not a target; if you hit it without an answer, stop, write down what you learned, and treat "needs more time" as the answer for now
- **Prerequisites** — spikes that must be done first
- **Steps** — a concrete, ordered starting point (adjust as you learn)
- **Exit criteria** — what "done" looks like for this spike specifically
- **Decision log** — fill this in when the spike is done

---

## Index

| ID | Title | Phase | Paths (primary) |
|---|---|---|---|
| SPIKE-00 | Project scaffold | 0 — Foundations | `package.json`, `tsconfig.json`, `vite.config.ts` |
| SPIKE-01 | CI/CD pipeline for Vercel deploys | 0 — Foundations | `.github/workflows/deploy.yml`, `package.json` |
| SPIKE-02 | Design tokens & global styles | 0 — Foundations | `src/styles/tokens.css`, `src/styles/global.css` |
| SPIKE-03 | Shared OS types | 1 — State | `src/types/os.ts` |
| SPIKE-04 | OS reducer + context | 1 — State | `src/state/osReducer.ts`, `src/state/osContext.tsx` |
| SPIKE-05 | Layout/track persistence | 1 — State | `src/state/persistence.ts` |
| SPIKE-06 | Window drag mechanics | 2 — Window manager | `src/hooks/useDraggable.ts`, `src/components/Window.tsx` |
| SPIKE-07 | Window resize mechanics | 2 — Window manager | `src/hooks/useResizable.ts`, `src/components/Window.tsx` |
| SPIKE-08 | Focus/z-index stacking | 2 — Window manager | `src/state/osReducer.ts`, `src/components/Window.tsx` |
| SPIKE-09 | Minimize/maximize/close + taskbar sync | 2 — Window manager | `src/components/Window.tsx`, `src/components/Taskbar.tsx` |
| SPIKE-10 | Pixel icon component + icon grid | 3 — Desktop shell | `src/components/icons/PixelIcon.tsx`, `src/components/DesktopIconGrid.tsx` |
| SPIKE-11 | Start menu | 3 — Desktop shell | `src/components/StartMenu.tsx` |
| SPIKE-12 | Taskbar + live clock | 3 — Desktop shell | `src/components/Taskbar.tsx`, `src/hooks/useClock.ts` |
| SPIKE-13 | Boot screen | 3 — Desktop shell | `src/components/BootScreen.tsx` |
| SPIKE-14 | Cityscape rendering approach | 4 — Live background | `src/components/background/CityscapeBackground.tsx` |
| SPIKE-15 | Car animation loop | 4 — Live background | `src/components/background/Car.tsx` |
| SPIKE-16 | Layering background with CRT effects | 4 — Live background | `src/components/background/*`, `src/styles/crt-effects.css` |
| SPIKE-17 | Background performance profiling | 4 — Live background | `src/components/background/*`, `src/hooks/usePrefersReducedMotion.ts` |
| SPIKE-18 | YouTube IFrame API integration | 5 — Music player | `src/components/audio/MusicPlayer.tsx`, `src/types/youtube.d.ts` |
| SPIKE-19 | YouTube URL parsing | 5 — Music player | `src/components/audio/musicUtils.ts` |
| SPIKE-20 | Autoplay policy handling | 5 — Music player | `src/components/audio/MusicPlayer.tsx` |
| SPIKE-21 | Custom URL input UI | 5 — Music player | `src/components/audio/MusicPlayer.tsx` |
| SPIKE-22 | Player controls + persistence | 5 — Music player | `src/components/audio/MusicPlayer.tsx`, `src/state/persistence.ts` |
| SPIKE-23 | About Me app | 6 — Apps | `src/components/apps/AboutApp.tsx`, `src/data/about.ts` |
| SPIKE-24 | Projects app | 6 — Apps | `src/components/apps/ProjectsApp.tsx`, `src/data/projects.ts` |
| SPIKE-25 | Resume app | 6 — Apps | `src/components/apps/ResumeApp.tsx`, `public/resume.pdf` |
| SPIKE-26 | Contact app | 6 — Apps | `src/components/apps/ContactApp.tsx`, `src/data/siteConfig.ts` |
| SPIKE-27 | Terminal app | 6 — Apps | `src/components/apps/TerminalApp.tsx`, `src/components/apps/terminalCommands.ts` |
| SPIKE-28 | Keyboard navigation & focus | 7 — Accessibility | `src/hooks/useFocusTrap.ts` |
| SPIKE-29 | prefers-reduced-motion audit | 7 — Accessibility | `src/hooks/usePrefersReducedMotion.ts` |
| SPIKE-30 | Mobile fullscreen fallback | 7 — Accessibility | `src/components/Window.tsx`, `src/styles/responsive.css` |
| SPIKE-31 | TypeScript strictness + lint + type-check | 8 — Quality & release | `tsconfig.json`, `.eslintrc.cjs` |
| SPIKE-32 | Vercel preview + prod verification | 8 — Quality & release | `vercel.json`, `package.json` |

---

## Phase 0 — Foundations

### SPIKE-00 — Project scaffold
**Paths:** `package.json`, `tsconfig.json`, `vite.config.ts`, `src/main.tsx`, `src/App.tsx`, `index.html`
**Objective:** stand up a working Vite + React + TypeScript app with strict mode on from the start.
**Time-box:** 1 hr
**Prerequisites:** none

**Steps:**
1. `npm create vite@latest portfolio-os -- --template react-ts`
2. In `tsconfig.json`, confirm/set `"strict": true`, `"noUncheckedIndexedAccess": true`, `"noUnusedLocals": true`, `"noUnusedParameters": true`.
3. Delete the template's default demo content from `App.tsx`; replace with a placeholder `<div>Portfolio-OS</div>` so there's a green build to branch from.
4. Confirm `npm run dev` and `npm run build` both succeed with zero type errors.
5. Commit this as the empty baseline before any feature work.

**Exit criteria:** `npm run build` succeeds, `tsc --noEmit` reports zero errors, dev server renders the placeholder.

**Decision log:**
- Decision: scaffolded in place with `npm create vite@latest . -- --template react-ts` (Vite 8.2, React 19.2, TypeScript 6.0). Kept the template's split TypeScript config rather than flattening it into one `tsconfig.json`, and put all four strictness flags in **`tsconfig.app.json`** (plus `tsconfig.node.json` for `vite.config.ts`), because the root `tsconfig.json` is a solution file (`"files": []` + project references) and compiler options there apply to nothing. Type-check script is **`tsc -b`**, not `tsc --noEmit`.
- Notes:
  - **The template ships no `strict` flag at all.** `create-vite`'s react-ts template sets `noUnusedLocals`/`noUnusedParameters`/`erasableSyntaxOnly`/`noFallthroughCasesInSwitch` but not `strict` or `noUncheckedIndexedAccess`. Both were added by hand. Verified they actually bite by compiling a throwaway probe file with three deliberate violations — got exactly the three expected errors (`TS7006` implicit any, `TS18047` possibly null, `TS18048` possibly undefined from an index access), then deleted the probe and confirmed a clean build. Worth doing: "strict is on" is otherwise an assumption nobody checks until it's expensive.
  - **`tsc --noEmit` at the repo root type-checks nothing.** Confirmed empirically: `npx tsc --noEmit --listFiles` emitted zero lines, because the root config includes no files. Anything relying on `tsc --noEmit` (SPIKE-01 step 4, `architecture.md` §12, SPIKE-31 step 4) would have silently passed forever. `tsc -b` builds both referenced projects, and since both set `noEmit: true` it type-checks without writing output — same intent, actually works.
  - **The linter is `oxlint`, not ESLint.** Vite 8's template scaffolds `.oxlintrc.json` and a `"lint": "oxlint"` script. Left as-is rather than swapping in `typescript-eslint`: it satisfies the pipeline's lint step, it's already installed and configured, and adding ESLint back would mean a new toolchain for no benefit at this stage. Flagged for SPIKE-31 to revisit if a type-aware rule turns out to be genuinely needed (oxlint's type-aware coverage is thinner than `typescript-eslint`'s).
  - **Node floor is higher than the docs assumed.** Vite 8 and oxlint both declare `engines: ^20.19.0 || >=22.12.0`. `package.json` now mirrors that exactly instead of `architecture.md`'s original `>=20`, which would have permitted e.g. Node 20.5 and then failed at install/build time. CI's `node-version: 20` resolves to 20.19+, so it still satisfies the floor — but see SPIKE-01 notes, since Node 20 is past end-of-life.
  - Deleted the template demo content: `App.css`, `index.css`, `src/assets/*`, `public/icons.svg`, and the whole demo `App.tsx` body (now `<div>Portfolio-OS</div>`). Kept `public/favicon.svg` for now; it's the Vite logo and needs replacing before launch (SPIKE-32 step 3 covers favicon/meta).
  - `.env.local` confirmed gitignored *before* the first commit, via `git check-ignore -v .env.local` → matched by `.gitignore:13:*.local`. Note that **`.env.local` does not currently exist in the repo** — only `.env.local.example`. See SPIKE-01 notes.
  - Placeholder render verified for real, not assumed: headless Chrome `--dump-dom` against the dev server returned `<div id="root"><div>Portfolio-OS</div></div>`.
  - Local `npm` is 8.5.2 (an old global shadowing Node 22's bundled 10.9.3), so `package-lock.json` is lockfileVersion 2. `npm ci` under CI's npm 10 reads v2 fine, so this is harmless — noted only so a future lockfile-version change isn't mistaken for a problem.
- Architecture.md impact: §0 confirmed as written (React + Vite + TS, strict from day one). Updated **§11** to record the split tsconfig and where strictness actually lives, and **§12** to correct the type-check command (`tsc -b`), the linter (`oxlint`), and the Node engines range.

---

### SPIKE-01 — CI/CD pipeline for Vercel deploys
**Paths:** `.github/workflows/deploy.yml`, `package.json` scripts, `README.md`
**Objective:** deployment happens automatically through a GitHub Actions pipeline (build → type-check → lint → deploy), triggered by pushes and PRs — never by anyone running `vercel deploy` from a local or agent shell. This spike sets up the pipeline itself; it does **not** fully complete on its own, because creating the Vercel project requires one interactive, human-only step (see step 2).
**Time-box:** 1 hr (excluding the human step in step 2, which happens outside this time-box)
**Prerequisites:** SPIKE-00

**Steps:**
1. Push the SPIKE-00 baseline to the GitHub repo at `GITHUB_REPO_URL` (from `.env.local`).
2. **Human-only step — cannot be automated:** the repo owner runs `vercel link` once from their own machine (this requires an interactive Vercel login) to create the Vercel project, then retrieves `VERCEL_TOKEN` (vercel.com/account/tokens), `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID`, and adds all three as GitHub Actions repository secrets (repo → Settings → Secrets and variables → Actions). If these secrets aren't present yet, write the workflow file anyway (steps 3-5), then stop and report exactly this to the user — don't attempt a workaround.
3. Add `.github/workflows/deploy.yml` with three jobs: `build` (checkout, setup Node 20, `npm ci`, `npm run type-check`, `npm run lint`, `npm run build` — runs on every push and PR), `deploy-preview` (runs only on `pull_request`, uses `vercel pull`/`vercel build`/`vercel deploy --prebuilt` against the `preview` environment, then comments the resulting URL on the PR), and `deploy-production` (runs only on push to `main`, same pattern against `--prod`). Use `secrets.VERCEL_TOKEN`, `secrets.VERCEL_ORG_ID`, `secrets.VERCEL_PROJECT_ID` — never hardcode them. A working starting point:

   ```yaml
   name: CI/CD

   on:
     push:
       branches: [main]
     pull_request:
       branches: [main]

   jobs:
     build:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - uses: actions/setup-node@v4
           with:
             node-version: 20
         - run: npm ci
         - run: npm run type-check
         - run: npm run lint
         - run: npm run build

     deploy-preview:
       if: github.event_name == 'pull_request'
       needs: build
       runs-on: ubuntu-latest
       env:
         VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
         VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
       steps:
         - uses: actions/checkout@v4
         - uses: actions/setup-node@v4
           with:
             node-version: 20
         - run: npm ci
         - run: npx vercel pull --yes --environment=preview --token=${{ secrets.VERCEL_TOKEN }}
         - run: npx vercel build --token=${{ secrets.VERCEL_TOKEN }}
         - id: deploy
           run: echo "url=$(npx vercel deploy --prebuilt --token=${{ secrets.VERCEL_TOKEN }})" >> "$GITHUB_OUTPUT"
         - uses: actions/github-script@v7
           with:
             script: |
               github.rest.issues.createComment({
                 issue_number: context.issue.number,
                 owner: context.repo.owner,
                 repo: context.repo.repo,
                 body: `Preview deployed: ${{ steps.deploy.outputs.url }}`
               })

     deploy-production:
       if: github.ref == 'refs/heads/main' && github.event_name == 'push'
       needs: build
       runs-on: ubuntu-latest
       env:
         VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
         VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
       steps:
         - uses: actions/checkout@v4
         - uses: actions/setup-node@v4
           with:
             node-version: 20
         - run: npm ci
         - run: npx vercel pull --yes --environment=production --token=${{ secrets.VERCEL_TOKEN }}
         - run: npx vercel build --prod --token=${{ secrets.VERCEL_TOKEN }}
         - run: npx vercel deploy --prebuilt --prod --token=${{ secrets.VERCEL_TOKEN }}
   ```

4. Add `"type-check": "tsc --noEmit"` and `"lint": "eslint ."` to `package.json` if SPIKE-31 hasn't already (pull that forward here since this pipeline depends on both scripts existing — note the dependency in SPIKE-31's own entry too).
5. Write the pipeline's behavior into `README.md` (what triggers a preview vs. a production deploy, where secrets live) so it doesn't need to be rediscovered later.
6. Once secrets exist (whether added now by the human or later), open a throwaway PR to confirm the `deploy-preview` job runs and comments a working URL, then merge it to confirm `deploy-production` runs and the production URL updates.

**Exit criteria:** `deploy.yml` exists and its `build` job passes on every push regardless of secrets. Once the human has added the three secrets, a PR produces a working preview URL and a merge to `main` produces a working production URL — both verified by actually opening them, not just checking the Action succeeded.

**Decision log:**
- Decision: wrote `.github/workflows/deploy.yml` byte-for-byte as the YAML above, with three jobs (`build`, `deploy-preview`, `deploy-production`) and no structural changes. Pushed to `main` and verified against a real run. **`build` passes; both deploy jobs are blocked on the human-only step and are currently failing loudly.** No workaround was attempted — see below.
- Notes (were secrets available immediately, or did this spike stop and wait on the human step?):
  - **Secrets were not available, and still aren't.** `gh secret list --repo swap-mitra/portfolio-os` returns an empty list: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID` all do not exist. This spike therefore stopped at step 6 and is waiting on the repo owner, exactly as step 2 anticipated.
  - **`build` job verified green on a real push** (run 31259757323, 16s): `npm ci` → `npm run type-check` → `npm run lint` → `npm run build` all passed. This confirms the important half of the exit criteria — the pipeline catches type/lint/build errors independently of any Vercel credential.
  - **`deploy-production` fails at `npx vercel pull`** with exit 1, because `--token=${{ secrets.VERCEL_TOKEN }}` interpolates to a literal empty `--token=`. This is the expected, correct failure mode: it is loud rather than silent, and `needs: build` means nothing deploys off a broken build either way.
  - **Deliberately did NOT add an `if: secrets.VERCEL_TOKEN != ''` guard** to make the deploy jobs skip cleanly while credentials are missing. That would turn `main` green and make the missing setup easy to forget — the instruction for this spike was explicitly not to skip or fake the pipeline. Consequence to be aware of: **every push to `main` will show a red X until the three secrets are added.** The red X is the reminder. Once secrets exist it goes green with no workflow edit needed.
  - No local `vercel` command was run, no `vercel deploy`, no `.vercel/` directory created. `.vercel` was added to `.gitignore` so that when the owner does run `vercel link`, the resulting `project.json` (which contains org/project IDs) can't be committed by accident.
  - **`type-check` and `lint` scripts:** step 4 asked for `"type-check": "tsc --noEmit"` and `"lint": "eslint ."`. Shipped as **`tsc -b`** and **`oxlint`** instead — see SPIKE-00's notes for why (`tsc --noEmit` checks zero files here; oxlint is what the template scaffolds). The pipeline YAML itself is unchanged because it calls the npm scripts rather than the tools directly, which is what makes this substitution invisible to the workflow.
  - **Pre-existing deprecation warning to fix later, not urgent:** the runner annotates every job with "Node.js 20 is deprecated… `actions/checkout@v4`, `actions/setup-node@v4` are being forced to run on Node.js 24." That's about the *actions'* own runtime, not our `node-version: 20` input. Left as-is since the spec pins these versions explicitly and it's currently a warning, not a failure; bumping to `actions/checkout@v5` + `actions/setup-node@v5` is the fix when it starts to matter.
  - **Separately worth reconsidering:** `node-version: 20` sits exactly on Vite 8's floor (`^20.19.0`), and Node 20 is itself past end-of-life. It works today. Moving the workflow and `engines` to Node 22 would be the more durable choice, but it contradicts the pinned spec, so it's flagged for the owner rather than changed unilaterally.
- Architecture.md impact: §12 — job names and structure are unchanged from the plan, so no structural edit. Updated §12 to record the actual type-check/lint commands, the corrected Node engines range, and that the three secrets are still outstanding so the deploy jobs have never run.

---

### SPIKE-02 — Design tokens & global styles
**Paths:** `src/styles/tokens.css`, `src/styles/global.css`, `index.html` (font `<link>` tags), `src/vite-env.d.ts`
**Objective:** get the mockup's exact palette, fonts, and base resets into the real project, and decide Google Fonts CDN links vs. self-hosted fonts.
**Time-box:** 1 hr
**Prerequisites:** SPIKE-00

**Steps:**
1. Port the `:root` custom properties from `portfolio-os-mockup.html` into `src/styles/tokens.css` verbatim.
2. Add `Press Start 2P` and `VT323` via Google Fonts `<link>` tags in `index.html` (matching the mockup) as the default; note as a follow-up whether self-hosting via `@fontsource/press-start-2p` and `@fontsource/vt323` is worth it for reliability/perf (no external request, works offline in dev).
3. Import `tokens.css` and a minimal `global.css` (box-sizing reset, base `html`/`body` styles) in `main.tsx`.
4. Render a small unstyled test page using a few of the tokens to visually confirm they match the mockup.

**Exit criteria:** the test page's colors and fonts are visually identical to the mockup.

**Decision log:**
- Decision (CDN vs self-hosted fonts): **Google Fonts CDN `<link>` tags**, identical to the mockup's (both `preconnect` hints plus one stylesheet request with `display=swap`). Self-hosting via `@fontsource/press-start-2p` + `@fontsource/vt323` is deliberately *not* done now: it would add two dependencies and put font bytes in the build to remove two third-party requests on a two-font static site. Recorded as a future optimisation in `architecture.md` §6/§14 rather than a to-do — revisit only if the fonts measurably hurt LCP in SPIKE-32's Lighthouse pass, or if offline dev becomes annoying.
- Notes:
  - Tokens were ported **verbatim and verified as such, not by eye**: extracted the `--name:#hex` pairs from both `portfolio-os-mockup.html`'s `:root` block and `src/styles/tokens.css` and diffed them — all 8 identical, zero differences. Same check on the font URL: the `family=Press+Start+2P&family=VT323&display=swap` query string matches the mockup's exactly.
  - Split into two files as the spike specified: `tokens.css` (custom properties only) and `global.css` (the `*` box-sizing reset and the `html,body` rule from the mockup, including `-webkit-font-smoothing: none`, which matters — it's what keeps the pixel fonts crisp instead of antialiased). Both imported from `main.tsx`, tokens first.
  - **Added two things the mockup only had implicitly:**
    - `--font-display` / `--font-body` custom properties, so `'Press Start 2P', monospace` isn't re-typed in a dozen components (the mockup repeats that literal string 7 times). The `.pixel` helper class from the mockup is kept as well, since it's what the mockup's markup uses.
    - `--z-*` custom properties for the whole layer stack from `architecture.md` §6. The layering is a cross-component contract; leaving it as magic numbers scattered across components is how a background ends up on top of the taskbar.
  - `#root { height: 100% }` was needed and isn't in the mockup — the mockup's `#desktop` is a direct child of `body`, but in React it sits inside `#root`, which would otherwise collapse and break the `height: 100vh` desktop.
  - Moved the mockup's `.icon:focus-visible` ring to a global `:focus-visible` rule instead of an icon-scoped one, since every interactive element in the app needs it and the neon-on-dark palette makes the browser default nearly invisible. Early partial credit for SPIKE-28.
  - **Verified visually against the mockup by screenshotting both** in headless Chrome at the same viewport, not by assuming the CSS was right: both fonts load and render (Press Start 2P on the pixel headings, VT323 on body copy), and the magenta title bar / cyan taskbar border / yellow Start button / green clock all read the same in both. `src/App.tsx` currently holds a throwaway token-proof page that renders all 8 swatches plus mockup-matched window and taskbar chrome; it gets replaced by the real `Desktop` in Phase 2/3.
  - One cosmetic non-issue: the `▸` glyph in "▸ START" isn't in Press Start 2P, so it falls back to a system font. This happens identically in the mockup, so it's inherited-as-approved rather than a porting error.
  - **Bonus finding — the palette's contrast risk isn't real.** `architecture.md` §10 warned neon-on-dark "can fail contrast checks", so all 15 foreground/background pairs were actually computed against WCAG. Everything passes AA for body text, with the weakest pair still at 4.54:1. `--paper` on `--ink` is 15.84:1; `--magenta` on `--ink` is 5.45:1, which is the one I expected to fail and doesn't. So no palette adjustment is needed and magenta is safe for text, not just chrome. Recorded in §10 so it isn't re-litigated later.
- Architecture.md impact: §6 — recorded the CDN font-loading decision, the two font/z-index custom-property additions, and the explicit wordmark layer value. §10 — replaced the "verify this passes" warning with the measured contrast ratios. §14 — added self-hosted fonts as an optional future optimisation.

---

## Phase 1 — Core OS state & types

### SPIKE-03 — Shared OS types
**Paths:** `src/types/os.ts`
**Objective:** finalize the `WindowState`, `MusicState`, and `OSState` interfaces so every later spike builds against a stable contract.
**Time-box:** 1 hr
**Prerequisites:** SPIKE-00

**Steps:**
1. Copy the interfaces from `architecture.md` §3 into `src/types/os.ts` as the starting point.
2. Write a short scratch file (or a `.test.ts`) that constructs a sample `OSState` object by hand to sanity-check the shape actually covers everything the mockup demonstrates (drag, resize, minimize, maximize, close, focus order, music default/custom track, mute).
3. Adjust field names/types as issues surface; this is the cheapest point in the project to change them.

**Exit criteria:** a hand-constructed `OSState` sample type-checks and covers every interaction visible in the mockup.

**Decision log:**
- Decision: took `architecture.md` §3 as the starting point and made four changes — extracted `WindowBounds`, narrowed `selectedIconId` to `AppType | null`, added `shuttingDown: boolean`, and pinned down what `id` means. Validated by building a state snapshot per interaction in `src/types/os.test.ts` (17 assertions, all passing, and the whole file type-checks under `strict` + `noUncheckedIndexedAccess`).
- Notes:
  - **Gap found: FR7's shutdown overlay had nowhere to live.** Walking the mockup's Start Menu turned up `data-action="shutdown"`, which does nothing there but is a real requirement (FR7, SPIKE-11 step 2). It can't be local state in `StartMenu`, because activating the item closes the menu and would unmount the thing holding the flag. Added `shuttingDown: boolean` to `OSState`. This is exactly the kind of thing that's cheap now and annoying in Phase 3.
  - **Considered and rejected: `windowOrder: string[]`.** FR6 wants one taskbar tab per open window, and tabs must not jump around when focus changes — so ordering can't come from `zIndex`. The tempting fix is an explicit order array. It isn't needed: `Record<string, WindowState>` iterates non-integer-like string keys in insertion order per the language spec, the IDs are app names (never integer-like), and writing to an *existing* key keeps its original position — so `MOVE_WINDOW` firing sixty times during a drag can't reorder tabs. An order array would be a second source of truth to keep in sync with `windows` for zero benefit. There's a regression test for this (`taskbar tab order follows insertion order, not z-index`) so the assumption is pinned rather than tribal knowledge.
  - **One window per app, confirmed from the mockup.** The mockup has a single `#win-projects` and its taskbar tab shows/hides that one window; clicking the icon repeatedly re-opens the same window. So `OPEN_WINDOW` on an already-open app should focus (and un-minimize) the existing window, not stack duplicates. That makes `id` redundant with `appType` today — but `id` stays `string` rather than being narrowed to `AppType`, because that's the one field where keeping the door open costs nothing.
  - `WindowState extends WindowBounds` rather than nesting a `bounds` object. Flat `x`/`y`/`width`/`height` is what the mockup's inline styles and the drag/resize hooks want, and nesting would mean spreading two levels deep on every move.
  - **`prevBounds` stays optional** (`prevBounds?: WindowBounds`) rather than always-present. It's meaningless when a window isn't maximized, and `noUncheckedIndexedAccess`-style discipline is better served by the compiler forcing a check at the one place that restores it than by carrying a dummy value that could get restored by accident.
  - **`isMuted` is kept independent of `volume`** (rather than modelling mute as `volume === 0`), so unmuting returns to the previous level instead of silence. Tested.
  - Checked but deliberately left out of `OSState`: **boot screen progress** (SPIKE-13 — plays once then unmounts, so local state in `App` is the right scope), **mobile-vs-desktop layout** (derivable from a media query, not state), and **in-progress drag/resize offsets** (belongs in the hooks, not global state — putting it here would re-render every window on every pointer move). Noting these so a later phase doesn't "discover" them and widen the type reflexively.
  - Also considered adding the current track's *title* to `MusicState` for §8.3's "playing [track]" affordance. Left out: the title only exists after `player.getVideoData()` resolves, so it's player-derived rather than state, and `isDefaultTrack` already drives the default-vs-custom label §8.4 actually asks for.
  - Installed **vitest 4.1** as the test runner (`npm test` → `vitest run`). It's zero-config against the existing `vite.config.ts`, and SPIKE-04 step 4 and SPIKE-19 step 2 both require real unit tests, so the runner had to arrive here or one spike later. Tests import `{ describe, it, expect }` explicitly instead of enabling vitest globals, which avoids widening the `types` array in `tsconfig.app.json`.
- Architecture.md impact: §3 — updated the code block with all four changes and added a note explaining the `windowOrder` rejection and the one-window-per-app `id` semantics, so the next reader doesn't re-open settled questions.

---

### SPIKE-04 — OS reducer + context
**Paths:** `src/state/osReducer.ts`, `src/state/osContext.tsx`
**Objective:** implement the reducer covering all actions listed in `architecture.md` §3, with a typed `dispatch`.
**Time-box:** 2-3 hr
**Prerequisites:** SPIKE-03

**Steps:**
1. Define the discriminated-union `Action` type (one variant per action listed in §3).
2. Implement `osReducer(state, action): OSState`, one `case` per action.
3. Create `OSContext` + `OSProvider` (wraps `useReducer`) + a `useOS()` hook that returns `{ state, dispatch }`.
4. Write unit tests (`osReducer.test.ts`) for at least: opening a window assigns an incrementing `zIndex`; focusing a background window brings it to front; closing a window removes it and its taskbar tab; minimizing doesn't remove the window from state, just marks it.
5. Wrap `App.tsx` in `OSProvider`.

**Exit criteria:** reducer unit tests pass; a window can be opened/closed/focused via dispatched actions from a scratch test component.

**Decision log:**
- Decision:
- Notes:
- Architecture.md impact: §3 — note any action renamed/added/removed.

---

### SPIKE-05 — Layout/track persistence
**Paths:** `src/state/persistence.ts`
**Objective:** decide whether window layout and last-picked music track are worth persisting to `localStorage`, and if so, implement it without letting stale persisted state break a fresh visitor's first load.
**Time-box:** 1 hr
**Prerequisites:** SPIKE-04

**Steps:**
1. Prototype writing `state.windows` and `state.music.videoId`/`volume` to `localStorage` on change (debounced).
2. Prototype reading it back on load, merging with the default initial state rather than fully replacing it (so a schema change doesn't crash returning visitors).
3. Decide: is this worth shipping for v1, or is it a nice-to-have that adds complexity for little payoff? Record the decision either way.

**Exit criteria:** either a working, tested persistence layer, or a written decision to skip it for v1.

**Decision log:**
- Decision (ship it / defer it):
- Notes:
- Architecture.md impact: §3 — mark persistence as implemented or deferred.

---

## Phase 2 — Window manager

### SPIKE-06 — Window drag mechanics
**Paths:** `src/hooks/useDraggable.ts`, `src/components/Window.tsx`
**Objective:** a reusable drag hook using Pointer Events (not separate mouse/touch handlers) so it works on touch devices too.
**Time-box:** 2 hr
**Prerequisites:** SPIKE-04

**Steps:**
1. Implement `useDraggable(onDrag: (x, y) => void)` returning a `pointerdown` handler to attach to a title bar.
2. On `pointerdown`, call `element.setPointerCapture(event.pointerId)`; on `pointermove`, compute new `x`/`y` and call `onDrag`; on `pointerup`/`pointercancel`, release capture.
3. Clamp so the title bar can't be dragged fully off-screen (keep at least ~40px visible on each edge).
4. Wire into `Window.tsx`'s title bar, dispatching `MOVE_WINDOW`.
5. Manually test on desktop (mouse) and, if possible, a touch device or browser touch emulation.

**Exit criteria:** a window can be dragged smoothly by mouse and by touch, and can't be dragged fully off-screen.

**Decision log:**
- Decision:
- Notes:
- Architecture.md impact: §5 — confirm Pointer Events approach, or note why a different approach was needed.

---

### SPIKE-07 — Window resize mechanics
**Paths:** `src/hooks/useResizable.ts`, `src/components/Window.tsx`
**Objective:** same pattern as SPIKE-06 but for the corner resize handle, with enforced minimums.
**Time-box:** 1.5 hr
**Prerequisites:** SPIKE-06 (reuses the same Pointer Events pattern)

**Steps:**
1. Implement `useResizable(onResize: (width, height) => void, min: { width, height })`.
2. Attach to the resize-handle element; compute new dimensions relative to the window's current top-left corner on `pointermove`.
3. Enforce `minWidth: 280, minHeight: 200` (per `architecture.md` §5).
4. Wire into `Window.tsx`, dispatching `RESIZE_WINDOW`.
5. Test resizing from the corner doesn't also trigger a drag (the two handlers shouldn't fight over the same pointer events — stop propagation on the resize handle's `pointerdown`).

**Exit criteria:** a window can be resized smoothly down to its minimum and no smaller, without accidentally moving.

**Decision log:**
- Decision:
- Notes:
- Architecture.md impact: §5 — none expected unless minimums changed.

---

### SPIKE-08 — Focus/z-index stacking
**Paths:** `src/state/osReducer.ts`, `src/components/Window.tsx`
**Objective:** confirm the "bring to front on any interaction" behavior feels right with 3+ windows open, not just the single-window mockup case.
**Time-box:** 1 hr
**Prerequisites:** SPIKE-04, SPIKE-06

**Steps:**
1. Temporarily open 3-4 windows at once (via manual dispatch calls or temporary debug buttons) to have a real multi-window scenario to test against.
2. Confirm clicking anywhere on a background window (not just its title bar) brings it to front.
3. Confirm the `nextZIndex` counter doesn't overflow or cause visible glitches after many focus changes (rapid clicking between windows).
4. Confirm the taskbar's visual "active" state matches whichever window currently has the highest z-index.

**Exit criteria:** with several windows open, focus order always visually matches interaction order, and the taskbar agrees.

**Decision log:**
- Decision:
- Notes:
- Architecture.md impact: §5 — none expected.

---

### SPIKE-09 — Minimize/maximize/close + taskbar sync
**Paths:** `src/components/Window.tsx`, `src/components/Taskbar.tsx`
**Objective:** implement the three title-bar buttons and confirm the taskbar tab state stays in sync in every case.
**Time-box:** 1.5 hr
**Prerequisites:** SPIKE-04, SPIKE-08

**Steps:**
1. Wire the close button to dispatch `CLOSE_WINDOW`; confirm its taskbar tab disappears.
2. Wire minimize to dispatch `MINIMIZE_WINDOW`; confirm the window disappears visually but its taskbar tab remains and, when clicked, restores it (un-minimizes and focuses).
3. Wire maximize to dispatch `TOGGLE_MAXIMIZE`; store the pre-maximize bounds in `prevBounds` and confirm toggling again restores the exact previous position/size.
4. Confirm re-opening a closed app (via its desktop icon) creates a fresh `WindowState` rather than trying to reuse a stale one.

**Exit criteria:** all three controls behave correctly in combination (e.g. minimize then maximize then restore then close) without leaving orphaned taskbar tabs or windows.

**Decision log:**
- Decision:
- Notes:
- Architecture.md impact: §5 — none expected.

---

## Phase 3 — Desktop shell

### SPIKE-10 — Pixel icon component + icon grid
**Paths:** `src/components/icons/PixelIcon.tsx`, `src/components/DesktopIconGrid.tsx`, `src/components/DesktopIcon.tsx`
**Objective:** port the mockup's inline-SVG pixel icons into a reusable typed component, and the icon grid with click-to-select + double-click/Enter-to-open behavior.
**Time-box:** 1.5 hr
**Prerequisites:** SPIKE-04

**Steps:**
1. Create `PixelIcon` accepting a typed `variant: 'about' | 'projects' | 'resume' | 'contact' | 'terminal'` prop and rendering the matching 10×10 SVG (port directly from the mockup's `<svg>` blocks).
2. Create `DesktopIcon` (label + `PixelIcon` + selection state) and `DesktopIconGrid` (maps over `siteConfig.ts`'s icon list).
3. Wire click → `SELECT_ICON`; Enter/Space when focused → `OPEN_WINDOW` for that `appType`; click-on-empty-desktop → deselect.
4. Confirm `tabIndex` and focus rings work for keyboard-only navigation (this doubles as an early check for SPIKE-28).

**Exit criteria:** all five icons render correctly, are keyboard-navigable, and opening/selecting behaves like the mockup.

**Decision log:**
- Decision:
- Notes:
- Architecture.md impact: none expected.

---

### SPIKE-11 — Start menu
**Paths:** `src/components/StartMenu.tsx`
**Objective:** port the mockup's Start Menu, wired to real dispatch actions instead of the mockup's placeholder buttons.
**Time-box:** 1 hr
**Prerequisites:** SPIKE-04, SPIKE-09

**Steps:**
1. Render conditionally based on `startMenuOpen`.
2. "Programs" entries dispatch `OPEN_WINDOW` for the relevant app; "Documents" opens the Resume app; "Shut Down" shows a simple full-screen joke overlay (no real navigation needed).
3. Clicking outside the menu, or pressing `Escape`, closes it (`TOGGLE_START_MENU`/dedicated close action).

**Exit criteria:** every Start Menu entry does something real, and the menu closes correctly on outside-click and `Escape`.

**Decision log:**
- Decision:
- Notes:
- Architecture.md impact: none expected.

---

### SPIKE-12 — Taskbar + live clock
**Paths:** `src/components/Taskbar.tsx`, `src/hooks/useClock.ts`
**Objective:** port the taskbar, and extract the clock into a small reusable hook.
**Time-box:** 45 min
**Prerequisites:** SPIKE-09

**Steps:**
1. `useClock()` — `setInterval` updating a `Date` in state every second, cleaned up on unmount.
2. Render Start button, one tab per open (non-closed) window from `state.windows`, and the clock.
3. Confirm the `setInterval` doesn't leak if `Taskbar` were ever unmounted/remounted (it won't be in this app, but write it correctly anyway).

**Exit criteria:** clock updates every second with no console warnings about state updates after unmount.

**Decision log:**
- Decision:
- Notes:
- Architecture.md impact: none expected.

---

### SPIKE-13 — Boot screen
**Paths:** `src/components/BootScreen.tsx`
**Objective:** decide whether to build this for v1 (it's listed as optional in `architecture.md` §14) and, if so, implement a simple text-line boot sequence that unmounts into the desktop.
**Time-box:** 1 hr
**Prerequisites:** SPIKE-00

**Steps:**
1. Decide: in scope for v1, or deferred? (It's low-risk and high-charm — leaning "build it" is reasonable, but record the call.)
2. If building: a short sequence of pixel-font lines appearing with a typewriter/delay effect, ending in a "press any key" or auto-continue after ~2-3s.
3. Respect `prefers-reduced-motion` — skip straight to the desktop if set.

**Exit criteria:** either a working boot sequence that transitions cleanly into the desktop, or a recorded decision to defer it.

**Decision log:**
- Decision (build now / defer):
- Notes:
- Architecture.md impact: §14 — move this out of "future extensions" if built now.

---

## Phase 4 — Live background

### SPIKE-14 — Cityscape rendering approach
**Paths:** `src/components/background/CityscapeBackground.tsx`
**Objective:** build small throwaway prototypes of both candidate approaches from `architecture.md` §7 (CSS/SVG parallax vs. canvas) and pick one based on actual results, not assumption.
**Time-box:** 3 hr (this is the highest-uncertainty spike in the project — protect its time-box)
**Prerequisites:** SPIKE-02

**Steps:**
1. Build prototype A: 3-4 `<div>` layers with repeating SVG-background building silhouettes, animated via CSS `@keyframes` `translateX` loops at different speeds/opacities.
2. Build prototype B: a `<canvas>` with a `requestAnimationFrame` loop drawing the same layered silhouettes procedurally.
3. Compare both for: visual quality against the intended mood, code complexity/maintainability, and — critically — CPU/battery cost (use browser dev tools' performance panel on both).
4. Test whichever looks more promising on an actual mid-range phone, not just desktop Chrome.
5. Pick one; delete or archive the other's throwaway code.

**Exit criteria:** one approach is chosen and running as the real `CityscapeBackground` component, with a recorded reason for the choice.

**Decision log:**
- Decision (CSS/SVG / canvas):
- Notes (perf numbers, visual tradeoffs):
- Architecture.md impact: §7 — replace "recommended approach" language with the actual final decision.

---

### SPIKE-15 — Car animation loop
**Paths:** `src/components/background/Car.tsx`
**Objective:** a pixel-art car (reuse the `PixelIcon` crisp-SVG technique) driving across the scene on a loop, on its own parallax layer.
**Time-box:** 1.5 hr
**Prerequisites:** SPIKE-14

**Steps:**
1. Draw the car as a small crisp-edge SVG (headlight/taillight in `--yellow`/`--magenta` for a nice neon touch).
2. Animate it looping across the width of the viewport, matching whichever animation technique SPIKE-14 chose (CSS `@keyframes` or canvas draw loop).
3. Vary its speed slightly from the building layers so it reads as being "in front of" the skyline, not just another parallax layer.

**Exit criteria:** the car visibly drives across the scene on a smooth, seamless loop (no visible jump/reset).

**Decision log:**
- Decision:
- Notes:
- Architecture.md impact: none expected beyond confirming §7 already covers it.

---

### SPIKE-16 — Layering background with CRT effects
**Paths:** `src/components/background/*`, `src/styles/crt-effects.css`
**Objective:** confirm the scanline overlay, starfield, and vignette from the mockup still read correctly on top of a moving background instead of a solid color.
**Time-box:** 1 hr
**Prerequisites:** SPIKE-14, SPIKE-15

**Steps:**
1. Port `ScanlineOverlay` and `Starfield` from the mockup as their own components, placed above `CityscapeBackground` per the z-index order in `architecture.md` §6.
2. Visually check the scanline `mix-blend-mode: multiply` still looks right over the brighter cityscape (it may need a slightly different opacity than it did over flat black).
3. Confirm the starfield's stars are still visible against the (lighter, busier) cityscape sky and don't get lost.

**Exit criteria:** all three layers (cityscape, starfield, scanlines) read clearly together, matching the intended mood without looking muddy or over-busy.

**Decision log:**
- Decision (any opacity/value tweaks made):
- Notes:
- Architecture.md impact: §6 — update z-index/opacity values if they changed from the mockup's originals.

---

### SPIKE-17 — Background performance profiling
**Paths:** `src/components/background/*`, `src/hooks/usePrefersReducedMotion.ts`
**Objective:** this is the spike most likely to force a design compromise — treat it as a real checkpoint, not a formality.
**Time-box:** 1.5 hr
**Prerequisites:** SPIKE-14, SPIKE-15, SPIKE-16

**Steps:**
1. Implement `usePrefersReducedMotion()` (a small hook wrapping `matchMedia('(prefers-reduced-motion: reduce)')` with a change listener).
2. Under reduced motion, freeze the cityscape/car on a static frame and disable the starfield twinkle and scanline flicker (keep the scanlines themselves — just the flicker animation).
3. Profile actual frame rate and CPU usage on a real mid-range phone (not just desktop dev tools' simulated throttling) with the full scene running: cityscape + starfield + scanlines + at least one open window being dragged.
4. If frame rate is poor, cut back layers (fewer parallax layers, slower/simpler starfield) until it's smooth — visual richness is worth less than the site feeling laggy.
5. Add a `document.visibilitychange` listener to pause the animation loop when the tab isn't visible.

**Exit criteria:** smooth performance on a real mid-range phone with the full scene active, `prefers-reduced-motion` correctly simplifies everything, and the animation pauses in a backgrounded tab.

**Decision log:**
- Decision (any layers cut for performance):
- Notes (actual device tested, frame rate observed):
- Architecture.md impact: §7, §10 — record the final performance-driven design if it differs from the original plan.

---

## Phase 5 — Music player

### SPIKE-18 — YouTube IFrame API integration
**Paths:** `src/components/audio/MusicPlayer.tsx`, `src/types/youtube.d.ts`
**Objective:** get a minimal working embedded player under programmatic control (load, play, pause) before building any UI around it.
**Time-box:** 2 hr
**Prerequisites:** SPIKE-04

**Steps:**
1. Write `src/types/youtube.d.ts` — a small ambient declaration covering only the subset of `YT.Player` actually used (`loadVideoById`, `playVideo`, `pauseVideo`, `mute`, `unMute`, `setVolume`, `getPlayerState`, the `onReady`/`onStateChange` event callbacks).
2. In `MusicPlayer`, inject the `<script src="https://www.youtube.com/iframe_api">` tag on mount if it isn't already present (guard against double-injection in React StrictMode's double-invoke behavior in dev).
3. Implement `window.onYouTubeIframeAPIReady` to construct a `new YT.Player(...)` targeting a hidden/small `<div>`, loaded with the default video ID from `siteConfig.ts`.
4. Confirm programmatic `playVideo()`/`pauseVideo()` calls work from the browser console before wiring up any UI.

**Exit criteria:** a `YT.Player` instance is constructed and controllable, confirmed via manual console testing.

**Decision log:**
- Decision:
- Notes:
- Architecture.md impact: §8.1 — note any deviation from the plan (e.g. StrictMode issues and how they were resolved).

---

### SPIKE-19 — YouTube URL parsing
**Paths:** `src/components/audio/musicUtils.ts`
**Objective:** a pure, well-tested `extractVideoId` function — this is small but worth isolating and testing thoroughly since it's the main input-validation surface of the feature.
**Time-box:** 1 hr
**Prerequisites:** none (can be done in parallel with SPIKE-18)

**Steps:**
1. Implement `extractVideoId(url: string): string | null` covering the formats listed in `architecture.md` §8.2.
2. Write unit tests covering: a plain `watch?v=` URL, one with extra query params (`&t=30s` etc.), a `youtu.be` short link, an `embed/` URL, a `music.youtube.com` URL, and several invalid inputs (empty string, a non-YouTube URL, a YouTube URL with no video ID, random text) — confirm all invalid cases return `null` rather than throwing.
3. Confirm the function never throws — it's a boundary between untrusted user input and the rest of the app, so it must fail safely.

**Exit criteria:** all unit tests pass, including the invalid-input cases.

**Decision log:**
- Decision:
- Notes:
- Architecture.md impact: §8.2 — note any additional URL formats supported beyond the original list.

---

### SPIKE-20 — Autoplay policy handling
**Paths:** `src/components/audio/MusicPlayer.tsx`
**Objective:** implement and verify the muted-autoplay → unmute-on-gesture flow from `architecture.md` §8.3 across real browsers, since autoplay policy specifics vary and are easy to get subtly wrong.
**Time-box:** 2 hr
**Prerequisites:** SPIKE-18

**Steps:**
1. On player ready, call `mute()` then `playVideo()` — confirm this succeeds without a user gesture (muted autoplay is generally allowed).
2. Set `awaitingUserGesture: true` in state and render the "tap to unmute" affordance.
3. Add a one-time listener for the first `click`/`keydown`/`touchstart` anywhere on the document; on fire, call `unMute()` and dispatch `MUSIC_GESTURE_RESOLVED`, then remove the listener.
4. Manually test in Chrome, Firefox, and Safari specifically — autoplay policy details differ enough between them that "works in Chrome" isn't sufficient verification.
5. Test the case where the visitor's very first interaction is clicking a desktop icon (not the music player itself) — confirm that still correctly triggers the unmute, since the listener is global, not scoped to the player widget.

**Exit criteria:** muted autoplay starts on load in all three browsers tested, and any first interaction anywhere on the page correctly unmutes and starts audible playback exactly once.

**Decision log:**
- Decision:
- Notes (any browser-specific quirks found):
- Architecture.md impact: §8.3 — note any browser-specific workarounds needed.

---

### SPIKE-21 — Custom URL input UI
**Paths:** `src/components/audio/MusicPlayer.tsx`
**Objective:** the text input where a visitor pastes their own YouTube URL, with validation feedback wired to SPIKE-19's parser.
**Time-box:** 1.5 hr
**Prerequisites:** SPIKE-18, SPIKE-19

**Steps:**
1. Add a small text input + submit affordance to `MusicPlayer` (styled per `architecture.md` §8.4 — small, pixel-font label, consistent with the neon chrome).
2. On submit, call `extractVideoId`; if `null`, set `music.lastError` and show an inline friendly message ("Couldn't find a video in that link — try pasting the full YouTube URL.") rather than a raw error.
3. If valid, dispatch `LOAD_TRACK`, call `player.loadVideoById(videoId)`, and set `isDefaultTrack: false`.
4. Clear the input and any error state on successful load.
5. Confirm submitting an empty input, or the same URL twice in a row, doesn't break anything.

**Exit criteria:** pasting a valid URL swaps the track; pasting garbage shows a clear, non-technical error and doesn't crash or silently fail.

**Decision log:**
- Decision:
- Notes:
- Architecture.md impact: none expected beyond confirming §8.4/§8.2.

---

### SPIKE-22 — Player controls + persistence
**Paths:** `src/components/audio/MusicPlayer.tsx`, `src/state/persistence.ts`
**Objective:** play/pause, mute, and volume controls, and (if SPIKE-05 decided to build persistence) saving the visitor's last-picked track and volume.
**Time-box:** 1.5 hr
**Prerequisites:** SPIKE-18, SPIKE-20, SPIKE-05

**Steps:**
1. Wire a play/pause button to `playVideo()`/`pauseVideo()`, reflecting `getPlayerState()` in the UI (don't let the button's icon drift out of sync with actual playback state — listen to the `onStateChange` event rather than only tracking local intent).
2. Wire a mute toggle and a volume slider (`setVolume(0-100)`).
3. If persistence is in scope (SPIKE-05), save `videoId`/`volume` on change and restore on load — but always still start muted per SPIKE-20's flow, even if a volume level was restored, since autoplay policy applies regardless of a returning visitor's saved preference.
4. Confirm keyboard operability of every control (tab order, visible focus, space/enter to activate).

**Exit criteria:** all controls work, stay visually in sync with actual player state, and are fully keyboard-operable.

**Decision log:**
- Decision:
- Notes:
- Architecture.md impact: §8.4 — note final control set if it differs from the plan.

---

## Phase 6 — Apps

### SPIKE-23 — About Me app
**Paths:** `src/components/apps/AboutApp.tsx`, `src/data/about.ts`
**Objective:** simplest app — mostly confirms the window-content pattern other apps will follow.
**Time-box:** 45 min
**Prerequisites:** SPIKE-09

**Steps:**
1. Define `about.ts` exporting a typed bio content object (placeholder text is fine for now — flagged in `project-spec.md` §7 as owner-supplied).
2. Render it inside a `Window` using the `VT323` body style from the mockup.

**Exit criteria:** opens correctly from its desktop icon and Start Menu entry, content is readable and styled consistently.

**Decision log:**
- Decision:
- Notes:
- Architecture.md impact: none expected.

---

### SPIKE-24 — Projects app
**Paths:** `src/components/apps/ProjectsApp.tsx`, `src/data/projects.ts`, `src/types/content.ts`
**Objective:** data-driven rendering of the project list, matching the mockup's row layout.
**Time-box:** 1 hr
**Prerequisites:** SPIKE-09

**Steps:**
1. Define the `Project` interface in `src/types/content.ts` and `projects.ts` with the three placeholder entries from the mockup (or real ones if already supplied).
2. `ProjectsApp` maps over `projects.ts`, rendering the folder icon + title + description + external link per row, matching the mockup's `.proj-row` styling.
3. Confirm external links open in a new tab with `rel="noopener noreferrer"`.

**Exit criteria:** visually matches the mockup's Projects window, and is driven entirely from `projects.ts` (adding a project there requires no component code changes).

**Decision log:**
- Decision:
- Notes:
- Architecture.md impact: none expected.

---

### SPIKE-25 — Resume app
**Paths:** `src/components/apps/ResumeApp.tsx`, `public/resume.pdf`
**Objective:** decide and implement preview-then-download vs. direct download (left open in `project-spec.md` §6, FR8).
**Time-box:** 1 hr
**Prerequisites:** SPIKE-09

**Steps:**
1. Prototype option A: clicking the desktop icon directly triggers a file download (`<a href="/resume.pdf" download>`), no window opens.
2. Prototype option B: clicking opens a window with an embedded PDF preview (`<embed>`/`<iframe>` pointing at `/resume.pdf`) plus a download button.
3. Pick one — option A is simpler and matches "quick CV grab" use cases; option B fits the desktop-metaphor conceit better and lets a visitor preview before downloading. Either is defensible; record which was chosen and why.

**Exit criteria:** the Resume icon behaves as decided, and a real PDF (even a placeholder one) downloads/previews correctly.

**Decision log:**
- Decision (A / B):
- Notes:
- Architecture.md impact: §9 — update the Resume row in the apps table with the final behavior.

---

### SPIKE-26 — Contact app
**Paths:** `src/components/apps/ContactApp.tsx`, `src/data/siteConfig.ts`
**Objective:** straightforward — mailto link plus social links from config.
**Time-box:** 45 min
**Prerequisites:** SPIKE-09

**Steps:**
1. Add `contactLinks` (email, LinkedIn, GitHub, etc.) to `siteConfig.ts`.
2. Render them as a simple list in `ContactApp`, styled consistently with the other windows.

**Exit criteria:** all links are correct and open appropriately (`mailto:` for email, new tab for social links).

**Decision log:**
- Decision:
- Notes:
- Architecture.md impact: none expected.

---

### SPIKE-27 — Terminal app
**Paths:** `src/components/apps/TerminalApp.tsx`, `src/components/apps/terminalCommands.ts`
**Objective:** the hardcoded command parser, plus the optional `play <youtube-url>` tie-in to the music player noted in `architecture.md` §9.
**Time-box:** 2 hr
**Prerequisites:** SPIKE-09, SPIKE-04, (SPIKE-19 if building the `play` command)

**Steps:**
1. `terminalCommands.ts` exports a typed map of command name → handler function returning a string (or string array for multi-line output): `help`, `whoami`, `skills`, `projects`.
2. `TerminalApp` renders a simple scrollback + input line, appending each command and its output to the scrollback on Enter.
3. Unrecognized commands return a friendly "command not found" message (list available commands in the `help` output so it's discoverable).
4. Decide whether to build the `play <youtube-url>` command: if yes, parse the argument with `extractVideoId` (SPIKE-19) and dispatch the same `LOAD_TRACK` action the `MusicPlayer` input uses — this is a nice example of the terminal and the music widget sharing one source of truth rather than duplicating logic.
5. Confirm the input stays focused/usable via keyboard only, and up-arrow recalls the previous command (small nice-to-have, not required).

**Exit criteria:** all four base commands work and are discoverable via `help`; if built, `play <url>` correctly changes the track playing in `MusicPlayer`.

**Decision log:**
- Decision (`play` command built: yes/no):
- Notes:
- Architecture.md impact: §9 — confirm or remove the `play` command mention depending on the decision.

---

## Phase 7 — Accessibility & responsiveness

### SPIKE-28 — Keyboard navigation & focus
**Paths:** `src/hooks/useFocusTrap.ts`, touches most interactive components
**Objective:** a full pass confirming every interactive element is keyboard-reachable and that focus doesn't get lost when windows open/close.
**Time-box:** 2 hr
**Prerequisites:** all of Phase 2 and Phase 3

**Steps:**
1. Unplug the mouse (or just don't touch it) and try to complete every core flow using only Tab/Shift+Tab/Enter/Space/Escape/Arrow keys: open each app, drag focus between windows, use the Start Menu, use the Terminal, close everything.
2. Where focus visibly gets "lost" (e.g. after closing a window, focus should return somewhere sensible — the desktop or the icon that opened it, not vanish to `<body>`), implement `useFocusTrap`/manual `.focus()` calls to fix it.
3. Confirm every focusable element has a visible focus ring (don't rely on browser defaults alone if the neon theme makes them hard to see — a custom `:focus-visible` style using `--cyan` fits the aesthetic and is easier to see against the dark background).

**Exit criteria:** every core flow is completable with keyboard only, and focus never visibly "disappears."

**Decision log:**
- Decision:
- Notes:
- Architecture.md impact: §10 — note any specific focus-management patterns adopted.

---

### SPIKE-29 — prefers-reduced-motion audit
**Paths:** `src/hooks/usePrefersReducedMotion.ts`, all animated components
**Objective:** a dedicated pass (separate from SPIKE-17's performance-driven look at just the background) confirming every animation in the whole app respects the setting, not just the cityscape.
**Time-box:** 1 hr
**Prerequisites:** SPIKE-17, and all animated components built (scanlines, starfield, cityscape/car, Start button pulse, boot screen if built)

**Steps:**
1. Toggle `prefers-reduced-motion: reduce` in browser dev tools (or OS-level setting) and walk through the whole app.
2. List every animation still running: it should be none, or only genuinely functional ones with no motion-sickness risk (a blinking text cursor is generally fine; a scrolling parallax city is not).
3. Fix any missed cases.

**Exit criteria:** with reduced motion enabled, no decorative motion animation runs anywhere in the app.

**Decision log:**
- Decision:
- Notes (list of animations found and fixed):
- Architecture.md impact: §10 — confirm the list of what's affected is complete.

---

### SPIKE-30 — Mobile fullscreen fallback
**Paths:** `src/components/Window.tsx`, `src/styles/responsive.css`
**Objective:** implement FR11 — below the breakpoint, apps open fullscreen instead of as floating windows.
**Time-box:** 2.5 hr
**Prerequisites:** all of Phase 2, Phase 6

**Steps:**
1. Pick and document the breakpoint (768px suggested in `architecture.md` §10 — confirm it still feels right on real devices, adjust if not).
2. Below the breakpoint, `Window` renders without drag/resize handlers active, filling the viewport, with a visible close/back control (dragging/resizing physically doesn't make sense on a small touch screen).
3. Confirm the desktop icon grid and taskbar are still usable at small widths (may need their own responsive adjustments beyond just the window behavior).
4. Test on at least one real phone, not only a resized desktop browser window — touch target sizes and real viewport quirks (safe areas, address bar show/hide) don't show up in simulation.

**Exit criteria:** every app is fully usable on a real phone, and the transition between mobile and desktop layouts (e.g. rotating a tablet, resizing a browser window across the breakpoint) doesn't break state.

**Decision log:**
- Decision (final breakpoint value):
- Notes (device tested):
- Architecture.md impact: §10 — update the breakpoint value if it changed from the suggested 768px.

---

## Phase 8 — Quality & release

### SPIKE-31 — TypeScript strictness + lint + type-check
**Paths:** `tsconfig.json`, `.eslintrc.cjs` (or `eslint.config.js` for flat config), `package.json` scripts
**Objective:** confirm the whole codebase is clean under strict TypeScript and a reasonable lint config, and that both are enforced automatically, not just run manually and forgotten.
**Time-box:** 2 hr
**Prerequisites:** all feature phases substantially complete

**Steps:**
1. Run `tsc --noEmit` across the whole project; fix every error (should be few, if strict mode was on from SPIKE-00 as intended — this spike is a final sweep, not the first time types are checked).
2. Set up `typescript-eslint` with a reasonable ruleset (`recommended` + `recommended-requiring-type-checking` is a good starting point); fix or explicitly (and sparingly) suppress findings.
3. Grep the codebase for `any` — each one found should either be replaced with a real type or have an inline comment explaining why it's genuinely necessary (e.g. the untyped edges of the YouTube API).
4. Add `"type-check": "tsc --noEmit"` and `"lint": "eslint ."` to `package.json` scripts; wire the build script (`"build": "tsc -b && vite build"`) so a type error fails the build, per `architecture.md` §12.

**Exit criteria:** `npm run type-check` and `npm run lint` both pass clean; `npm run build` fails loudly on an intentionally-introduced type error (verify this, don't just assume it).

**Decision log:**
- Decision:
- Notes (any `any` usages kept, and why):
- Architecture.md impact: none expected — confirms §12 as written.

---

### SPIKE-32 — Vercel preview + prod verification
**Paths:** `vercel.json` (if needed), `package.json`
**Objective:** a final, deliberate check of the deployed site (not local dev) covering the features most likely to behave differently in production: the music player and the cityscape performance.
**Time-box:** 1.5 hr
**Prerequisites:** everything else

**Steps:**
1. Deploy the finished app to a Vercel preview URL.
2. On the actual preview URL (not `localhost`), verify: default music autoplay-then-gesture-unmute flow works, custom YouTube URL input works, cityscape animation runs smoothly, resume download works, all apps open correctly — on both a real desktop browser and a real phone.
3. Confirm `robots.txt`/basic meta tags (title, description, favicon) are present and sensible for a portfolio site being shared/linked.
4. Promote to production; repeat the same manual check list against the production URL once (build/runtime behavior can occasionally differ between preview and production environments, so don't assume production is fine just because preview was).

**Exit criteria:** the production Vercel URL passes the full manual check list on both desktop and a real phone.

**Decision log:**
- Decision:
- Notes (any prod-only issues found and fixed):
- Architecture.md impact: none expected — this spike verifies, rather than changes, the architecture.

---

## After all spikes: doc reconciliation pass

Once every spike above is complete, do one final read-through of `architecture.md` and `project-spec.md` against the actual built site. Spikes ask you to update the relevant section as you go, but a last pass catches anything that slipped through — this is the point where the docs should be a fully accurate description of what was actually shipped, not what was originally planned.
