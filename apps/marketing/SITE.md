# UI Organized — Marketing Site Build Instructions

Instructions for building the UI Organized marketing site in React. Read this whole
document before writing any code. The two HTML prototypes (`ui-organized-fall.html`,
`ui-organized-home.html`) are the **behavioral and visual spec** — the goal is to
rebuild that experience as a properly architected React app, not to invent a new design.

---

## 1. Context

UI Organized is an open source design system ecosystem: a web-based theme builder,
a Figma plugin, and an npm component library, all driven by one theme config file.
This marketing site is the public front door. It must *demonstrate* the product by
being built with it: every visible UI element on this site comes from the UI Organized
React library and its tokens. The site is itself the demo.

Primary references:
- `ui-organized-fall.html` — the homepage spec: matter.js falling UI pieces, scroll-driven
  assembly into an app frame, arrange mode with dot-grid snapping, portal effect,
  aurora gradient background, cursor glow, click bursts.
- `ui-organized-home.html` — earlier elastic-grid prototype. Not part of phase 1, but its
  hero may become a `/playground` page later; keep its logic portable.

## 2. Stack

- **Framework:** Next.js (App Router) with `output: 'export'` — fully static, no server.
  Rationale: SEO for a marketing site, and it fits the project's client-side-only rule.
  All animation-heavy modules are client components (`'use client'`).
- **Location:** `apps/website` inside the existing Turborepo + pnpm monorepo.
- **Physics:** `matter-js` as a real dependency (no CDN scripts).
- **Animation & graphics — approved technologies:** `matter-js`, **GSAP** (with
  ScrollTrigger), **three.js**, and raw **WebGL** are all available. Use them by role,
  not by enthusiasm:
  - `matter-js` — the hero fall/pile physics. Its domain ends at the physics phase.
  - **GSAP + ScrollTrigger** — scroll choreography (the stage pin, progress mapping,
    piece assembly tweens, title tuck, frame/caption fades) and section reveals.
    Prefer it over the prototype's hand-rolled lerp/easing where it simplifies code —
    but pick one driver per concern: a given animation is owned by GSAP **or** the
    rAF loop, never both fighting over the same transform.
  - **three.js / WebGL** — reserved for genuinely GPU-shaped work: the elastic-grid
    playground hero (port of `ui-organized-home.html`) if/when it ships, or upgrading
    the aurora backdrop to a shader if CSS blur costs too much on low-end devices.
    Do not introduce a WebGL canvas for effects CSS already handles well.
  - Respect `prefers-reduced-motion` in every one of these (GSAP:
    `gsap.matchMedia()`; matter/three: skip init entirely).
  - All of these load as lazy client chunks — none may block first paint.
- **Components:** the UI Organized React package (substitute the real package name,
  e.g. `@ui-organized/react`) plus its token CSS (e.g. `@ui-organized/tokens`).
- **Styling:** custom CSS files + CVA, exactly like the component library itself.
  **No Tailwind. No CSS-in-JS. No inline style objects for static styling** (inline
  styles are allowed only for per-frame animated transforms).
- **Fonts:** Baloo 2 (display), Hanken Grotesk (body), DM Mono (labels) via
  `next/font/google`, exposed as CSS variables (`--font-display`, `--font-body`,
  `--font-mono`).

## 3. Styling rules (read carefully — these are the DRY requirements)

1. **All color comes from CSS custom properties.** Never hard-code a hex value in a
   component stylesheet. Consume the design system's semantic tokens first
   (`--color-surface-*`, `--color-text-*`, `--color-action-*` etc. — use the real token
   names from the tokens package). Site-only values that don't exist in the system
   (aurora gradient stops, glow/burst alphas, the `--deep` hero background) live in
   **one file**: `styles/site-tokens.css`, defined once on `:root` and consumed
   everywhere else by reference.
2. **Spacing and radius use system tokens** (`--spacing-space-XX`,
   `--border-radius-radius-XX`). No magic pixel paddings in section layouts.
3. One CSS file per component, BEM-style class names, co-located with the component
   (`AuroraBackdrop.tsx` + `aurora-backdrop.css`). CVA only for variant class selection.
4. Shared layout primitives (`.wrap`, section padding rhythm, eyebrow text style,
   reveal-on-scroll classes) are defined once in `styles/layout.css` — never re-declared
   per section.
5. If two components need the same style, extract it (a shared class, a token, or a
   shared component) — do not copy-paste rules.

## 4. App structure

```
apps/website/
  app/
    layout.tsx              # fonts, token CSS imports, <Grain/>, metadata
    page.tsx                # homepage: composes sections, no logic of its own
    roadmap/page.tsx        # phase 3
  components/
    chrome/                 # SiteNav, SiteFooter, BrandMark (logo SVG, currentColor)
    sections/               # FeatureTrio, HowItWorks, CtaBand — content sections
    hero/                   # everything inside the scroll stage (see §5)
    gradient/               # AuroraBackdrop, CursorGlow, BurstLayer, Grain
    roadmap/                # phase 3 (see §7)
  hooks/                    # useScrollProgress, useReducedMotion, usePointerInStage
  lib/                      # pure logic, no React: lattice.ts, stagePhases.ts
  styles/                   # site-tokens.css, layout.css
  public/roadmap.json       # build artifact placeholder until the Action exists
```

Rules of thumb: pages compose sections; sections compose library components; anything
used twice becomes a component; anything stateful and reusable becomes a hook; anything
that is pure math (snapping, easing, phase windows) lives in `lib/` as plain TypeScript
with unit tests. This mirrors the monorepo principle that logic is framework-agnostic
and UIs are thin.

## 5. The hero scroll stage (port of the prototype, decomposed)

Recreate the prototype's behavior with this decomposition — do not write one 600-line
component:

- **`HeroStage`** — owns the 300vh scroll track and sticky viewport; composes everything
  below; provides stage context (dimensions, scroll progress P, current phase).
- **`useScrollProgress`** — returns P ∈ [0,1] for the stage, rAF-throttled. May be
  implemented on GSAP ScrollTrigger (pin + scrub) instead of hand-rolled scroll math —
  if so, ScrollTrigger owns the pinning and P, and everything downstream still
  consumes plain P so `stagePhases.ts` stays library-agnostic.
- **`stagePhases.ts`** — pure functions mapping P to phase (`physics` < 0.12,
  `assembling`, `organized` ≥ 0.965) and per-piece stagger windows with easing.
  Port the constants from the prototype; keep them in one exported config object.
- **`usePhysicsWorld`** — wraps matter-js: world setup, walls, staggered spawning
  (~140ms apart after a 350ms beat), MouseConstraint on fine pointers only
  (strip Matter's wheel listeners — there's a scroll-blocking bug otherwise, see the
  prototype's `buildMouse`), capture/release pose handoff between phases.
- **`PieceLayer`** — renders the 14 pieces and applies per-frame transforms.
  **The pieces are real library components** — `Button`, `Input`, `Toggle`, `Avatar`,
  `Badge`, `Tag`, `Slider`, `Progress`, `Checkbox`, etc. — wrapped in a `PhysicsPiece`
  positioning shell. Do not rebuild fake versions with divs; if the library lacks one
  (e.g. the mini bar chart), build it as a proper library-style component in the site.
  Piece definitions (size, slot, which component, props) live in one
  `pieceManifest.ts` file.
- **`AppFrame`** — the browser-chrome window. Owns the portal state (transparent
  interior + hero-aligned dot grid while arranging). Bar height and divider scale in
  `em` with the frame's font-size scaling.
- **`useArrangeGrid`** — arrange-mode drags, snapping to the global 44px dot lattice
  with the clamp + ring-search overlap logic from the prototype. The snapping math
  itself is in `lib/lattice.ts` (pure, tested): `snapToLattice`, `quantizeHomes`.
  Home slots are quantized to the lattice on mount and on resize, so the assembled
  layout, the arrange grid, and the visible dots always agree.
- **`HeroTitle`** — pinned heading that scales/tucks with P (transform only,
  eyebrow + hint fade early); **`EndCaption`** with the arrange hint and CTA.

Performance requirements: one rAF loop for the whole stage (drive it from a small
scheduler in `HeroStage`, not five competing `useEffect` loops); transforms only,
no layout-triggering style writes per frame; physics engine paused entirely outside
the physics phase.

## 6. Gradient system

- **`AuroraBackdrop`** — four blurred drifting fields, brand colors, screen blending,
  CSS keyframe animation (disabled under reduced motion).
- **`CursorGlow`** — lerped trailing glow; position updates inside the stage's shared
  rAF loop.
- **`BurstLayer`** — click bursts; suppress on nav clicks; colors cycle through the
  brand palette tokens.
- **`Grain`** — fixed full-page SVG-noise overlay, rendered once in `layout.tsx`.
- The dot grid is a reusable `DotGrid` style (one class), used by both the stage
  background and the AppFrame portal — the portal's `background-position` offset is
  computed from frame position so the lattices align (include the frame border width).

## 7. Roadmap page — live kanban from GitHub Projects (phase 3)

The roadmap is a public, read-only kanban that mirrors the admin's GitHub Projects v2
board and is styled entirely with the site's own system. Three parts: the board setup,
the sync pipeline, and the rendering.

### 7.1 Admin board setup (GitHub Projects v2)

- One org-level Project (so it can later aggregate issues from multiple repos).
- **Status** single-select field with exactly: `Backlog`, `In progress`, `Done`.
  These map 1:1 to site columns — do not invent extra columns on the site.
- **Type** single-select field: `Design`, `Development`, `Docs`, `Community`.
- Cards are issues or draft items; both must sync. Non-code tasks (design, docs)
  are ordinary issues — Figma links and screenshots in the body.
- Board ordering within a column is the admin's curation; the sync must preserve it.

### 7.2 Sync pipeline (GitHub Action → `roadmap.json`)

A workflow at `.github/workflows/roadmap-sync.yml` in the repo that owns the project:

- **Triggers:** `schedule` (cron, every 15 min), `workflow_dispatch` (manual), and
  `issues` events. (Projects v2 drag events don't reliably trigger workflows, so the
  cron is the baseline freshness guarantee — good enough for a roadmap.)
- **Auth:** a fine-grained PAT with read access to organization Projects, stored as a
  repo secret (`ROADMAP_TOKEN`). The default `GITHUB_TOKEN` cannot read org projects.
  The token exists only inside the Action — it must never reach the site bundle.
- **Query:** Projects v2 GraphQL — `organization.projectV2(number)` →
  `items(first: 100)` with each item's `fieldValueByName` for Status and Type, the
  item's content (`Issue` title/url/labels/state, or `DraftIssue` title), and board
  position order as returned.
- **Transform:** map to the JSON contract below. Rules: items with no Status are
  treated as `Backlog`; closed issues are forced into `Done` regardless of field;
  draft items get `"url": null` (render without a link); `Done` is truncated to the
  most recent 12 with `"doneOverflowUrl"` pointing at the project board.
- **Publish:** commit `roadmap.json` into `apps/website/public/` only when the content
  hash changed (avoids noisy commits and redeploys), which triggers the static
  redeploy. The site also fetches the deployed JSON client-side on the roadmap page so
  visitors get the latest sync without a hard refresh.

### 7.3 Data contract

The site only ever consumes this shape — never the GitHub API directly:

```json
{ "syncedAt": "ISO date",
  "projectUrl": "https://github.com/orgs/.../projects/1",
  "doneOverflowUrl": "...",
  "columns": [ { "id": "backlog|in-progress|done", "title": "string",
    "items": [ { "id", "title", "type": "design|development|docs|community",
      "url": "string|null", "labels": [] } ] } ] }
```

Keep a hand-written fixture at `lib/fixtures/roadmap.json` for local dev and as the
build-time fallback if the fetch fails.

### 7.4 Kanban rendering — styled as part of the site

Components: `RoadmapBoard` → `RoadmapColumn` → `RoadmapCard`, plus `SyncStatus`.

- **Page setting:** the calm register — light gradient wash background (same recipe as
  the homepage's `.after` section), with a faint **dot-grid panel behind the board**
  using the shared `DotGrid` style at low ink opacity. The lattice motif ties the
  roadmap to the hero: cards on the grid, organized.
- **Columns:** header is the mono eyebrow style (`BACKLOG`, `IN PROGRESS`, `DONE`)
  with a count in a library `Badge`. Column surfaces are quiet — no heavy container,
  a hairline or nothing; the cards carry the visual weight. Three columns desktop,
  horizontal snap-scroll or stacked sections on mobile (pick one and apply it
  consistently; stacked is the simpler, more accessible default).
- **Cards:** built from the library `Card` — paper surface token, 2px ink border,
  system radius token, the same hover lift + hard-shadow treatment as the homepage
  feature cards. Contents: title (body weight, two-line clamp), a **Type chip** using
  the library `Tag`/`Badge` with per-type token colors —
  design → magenta, development → cobalt, docs → sun, community → green — defined once
  as a `typeColorMap` against semantic tokens, not literals. Cards with a `url` are
  fully clickable links to the issue (whole-card link, visible focus ring); draft
  cards render the chip plus a subtle `draft` label and no link.
- **Done column:** completed cards get a small green check accent (reuse the
  checkbox-piece visual language from the hero) and reduced opacity; after the 12
  shown, a ghost-button link "See everything shipped →" to `doneOverflowUrl`.
- **SyncStatus:** mono label, e.g. `synced 4 min ago · live from GitHub`, computed
  from `syncedAt`, with a link to `projectUrl` inviting contribution.
- **States:** skeleton cards (token-colored shimmer, reduced-motion safe) while
  fetching; on error or empty, a friendly panel — "Roadmap is syncing — see it live
  on GitHub" with a button to the project. Never render a blank region.
- **Motion:** columns reveal with the shared reveal-on-scroll classes, cards
  staggered ~40ms within a column. No physics on this page.

## 8. Accessibility & motion quality bar (non-negotiable)

- `prefers-reduced-motion`: no physics, no drifting aurora, no glow-follow; pieces
  render directly in their organized lattice positions; reveals appear without
  animation. This is a first-class render path, not an afterthought.
- All decorative layers `aria-hidden`; the heading, copy, and CTAs are real document
  content readable without JS.
- Keyboard: every link/button focusable with visible focus styles from the design
  system; the arrange interaction is pointer-only enhancement, never the only way to
  reach content.
- Touch: piece dragging must not break page scroll (`touch-action` scoped to pieces
  in arrange mode; no MouseConstraint on coarse pointers).
- Lighthouse targets on the static build: 90+ across the board; ship the hero physics
  as a lazily loaded client chunk so first paint is just the gradient + heading.

## 9. Build phases (deliver in this order, working at each step)

1. **Scaffold + system plumbing** — app in the monorepo, tokens imported, fonts,
   `site-tokens.css`, chrome (nav/footer/logo), static sections with library
   components, reveal-on-scroll. No physics yet.
2. **Gradient layer** — aurora, grain, glow, bursts, dot grid. Reduced-motion path.
3. **Hero stage** — physics fall, scroll assembly, pinned title. Port constants from
   the prototype; verify feel matches it side by side.
4. **Arrange mode + portal** — lattice lib with tests, quantized homes, portal dots.
5. **Roadmap page** — build the kanban against the `roadmap.json` fixture first
   (§7.3–7.4), then add the sync Action (§7.2) and verify end-to-end: drag a card on
   the GitHub board → cron sync → JSON commit → redeploy → site updates.
6. **Polish pass** — responsive audit (down to 360px), a11y audit, Lighthouse, copy
   review against the prototype.

## 10. Definition of done

- Zero hard-coded colors outside `site-tokens.css`; spacing/radius via system tokens.
- Every interactive element on the page is a UI Organized library component (or a new
  component built to the library's own conventions and noted as a candidate for
  upstreaming).
- The prototype and the React build are indistinguishable in behavior at desktop and
  mobile sizes, except where this document deliberately improves on it.
- `pnpm build` produces a clean static export; no console errors; reduced-motion and
  no-JS paths verified.