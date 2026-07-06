# @ui-organized/figma-component-bridge

Figma plugin that turns `@ui-organized/react` components into Figma components — props, variants, states, layout, and token-bound Variables — via an intermediate **Spec JSON** contract. See [`COMPONENT-PLUGIN.md`](../../COMPONENT-PLUGIN.md) at the repo root for the full build plan.

Sibling of [`tooling/figma-plugin`](../figma-plugin) ("UI Organized – Theme Import"), which imports the design tokens into Figma Variables. **This plugin binds against the Variables that one creates** — run Theme Import first.

## Status — Phases 0–5

**Phase 0 (vertical slice).** The first, riskiest link: a **hand-authored** `Button` spec (`primary` / `secondary`) is built into a real Figma variant set whose fills are bound to live `interactive/*` Variables. No analyzer, no renderer, no companion service yet — those are Phases 2–3. The point is to prove the Figma Builder contract before anything depends on it.

- `createComponent()` per variant → auto-layout from the spec → `combineAsVariants()`.
- Fill / corner-radius / text-color bound to Figma Variables **by name**.
- Graceful degradation: any token that can't be matched paints its raw fallback (so the build stays visible) and is reported as an `unresolved` record — the seed for the Phase 5 resolution queue, shown in the UI.

**Phase 1 (token foundation).** The Theme Import plugin already creates the Variables; the remaining piece — the **Token Name Map** — is done here. `cssVarToFigma()` (`src/tokenNaming.ts`) maps any CSS custom property to its Figma Variable name using rules derived from the theme builder's export (`buildConfig.ts`) + the importer (`importTheme.ts`) — e.g. `--color-interactive-primary-default` → `Semantic : interactive/primary-default` (the leaf keeps its dashes; string-munging would get this wrong). `pnpm generate:token-map` enumerates `@ui-organized/tokens`' `variables.css` and emits the committed snapshot `src/generated/token-name-map.json` (145 tokens; primitives are theme-dependent and intentionally unmapped).

**Phase 2 (component manifest).** The Analyzer (`scripts/generate-component-manifest.ts`) statically reads every `@ui-organized/react` component's props interface with the TypeScript compiler API (source-file-only — no `@types/react`, no new dependency) and classifies each property: string-literal union → VARIANT axis, `boolean` → BOOLEAN, `children`/content strings → TEXT, `CanonicalIconName`/`icon` → INSTANCE_SWAP. `pnpm generate:manifest` emits the committed `src/generated/component-manifest.json` (47 components; 39 variant axes, 62 booleans, 42 text, 2 instance-swap). The UI reads it to render the searchable "select a component" list with each component's inferred axes. Classifications are guesses, overridable in the Phase 5 resolution UX.

**Phase 3 (render → spec).** Turns a component into real Spec JSON. Split into a pure half and a browser half:

- **Normalizer** (`src/normalize.ts`) — pure: walks a DOM capture into the Spec contract (flex → auto-layout, box model, typography, symbolic token refs; grid/absolute/untokenised → `unresolved`). DOM-free, so `pnpm check:normalizer` verifies it on two structurally different components (Button, Card) + a grid degradation case with **no browser** — the output is what the Phase 0 Builder consumes.
- **Renderer** (`scripts/render.ts`) — browser-gated: Playwright renders each variant against a running Storybook and extracts the capture — DOM tree + computed styles + the **authored** `var(--…)` behind each token property (CDP matched styles) + resolved token values; pseudo-states forced via CDP.
- **Orchestrator** (`scripts/generate-spec.ts`) — enumerates variants as **state** (default/hover/active/focus/disabled, forced via CDP) × **icon config** (none/left/right — the `icon` INSTANCE_SWAP + `iconPosition` folded into one axis, rendered with a representative icon) × the manifest VARIANT axes (capped → `AXIS_SELECTION`), renders, normalizes, writes `src/generated/specs/<Component>.json`. Icons are captured as SVG markup + their name (from the lucide/tabler class) in DOM order; disabled dimming carries through as node opacity. On build the icon's name is **matched to a local Figma component** — found → an instance wired to an `icon` **INSTANCE_SWAP** property (swappable in Figma); not found → a `SLOT_DEFAULT` resolution card (pick a component, remembered) with the SVG rebuilt as a vector (`figma.createNodeFromSvg`) as the fallback. So icon components must exist in the file (e.g. the Lucide library), the way Variables must (Theme Import). _Focus rings are a box-shadow, not yet captured._

To generate a real spec you need Playwright's browser and a running Storybook:

```sh
npx playwright install chromium
pnpm --filter @ui-organized/storybook dev          # or: storybook build + static serve
pnpm --filter @ui-organized/figma-component-bridge generate:spec -- Button   # STORYBOOK_URL defaults to :6006
```

**Phase 4 (build engine).** The whole pipeline is now usable end-to-end inside Figma. The orchestrator rewrites `src/generated/specs/index.ts` to statically import every committed spec, so the plugin bundles them: the UI's **Build** button is enabled for any component with a committed spec (and `Button` always, via the hand-authored slice), and the sandbox builds it by name. The Builder gained a tidy variant **grid** layout and wires an editable **TEXT** component property (e.g. `children`) onto label nodes. Full node construction (frames, text, auto-layout, strokes, radius, token binds) was already in place from Phase 0. _BOOLEAN / INSTANCE_SWAP property wiring and effects need spec enrichment and are deferred; in-Figma verification of the new component-property + grid code is still pending (it typechecks against `@figma/plugin-typings`)._

**Phase 5 (resolution UX).** Anything the pipeline can't auto-decide becomes a reviewable, persistent choice. The build report's queue is deduplicated (one card per token, not per occurrence — 132 misses → ~10 cards) and each `TOKEN_NO_MATCH` card carries a dropdown: candidate Variables, then same-collection Variables, then **"Accept raw value"**. Picks are sent as a **Resolution Map** (`src/resolution.ts`), keyed by `component + kind + token`, and persisted on the Figma document (`root.pluginData`) so they survive across runs. The Builder pre-applies them (`decideToken`): a remembered "bind to X" binds; "accept raw" paints the captured fallback and stops reporting it. So a second build **converges** — only genuinely new ambiguities surface. _The flow + persistence are wired and typecheck against `@figma/plugin-typings`; in-Figma verification of the dropdown round-trip is pending. Exporting the Resolution Map as repo-committed JSON (for PR review) is a later add — today it lives in the document._

## Architecture

- `src/spec.ts` — the **Spec JSON contract** (§2 of the plan). The boundary everything negotiates through.
- `src/tokenNaming.ts` — `cssVarToFigma()`, the locked CSS-var → Figma Variable naming rules.
- `src/generated/token-name-map.json` — committed snapshot of every mapped token (regenerate with `pnpm generate:token-map`).
- `src/tokenMap.ts` — runtime name-matched resolver over the file's live Variables, with candidate suggestions on a miss.
- `src/manifest.ts` — Component Manifest types (the Analyzer's output schema).
- `scripts/generate-component-manifest.ts` — the Analyzer (Phase 2); emits `src/generated/component-manifest.json` (`pnpm generate:manifest`).
- `src/capture.ts` — the DOM capture contract (renderer → normalizer).
- `src/normalize.ts` — the Normalizer (Phase 3): capture → Spec JSON. Pure, tested via `scripts/check-normalizer.ts`.
- `scripts/render.ts` — the Playwright Renderer (Phase 3, browser-gated).
- `scripts/generate-spec.ts` — render → normalize → `src/generated/specs/<Component>.json` (`pnpm generate:spec -- <Component>`).
- `src/builder.ts` — sandbox-side Builder: spec → Figma nodes + Variable binding, variant grid, TEXT component property, resolution apply.
- `src/resolution.ts` — Resolution Map types + key (Phase 5); persisted on the document, applied by the Builder.
- `src/generated/specs/index.ts` — generated map of committed specs the plugin can build (Phase 4).
- `src/fixtures/buttonSlice.ts` — the hand-authored Phase 0 spec.
- `src/code.ts` — sandbox entry (has the `figma` API).
- `src/ui.tsx` / `ui.html` / `ui.css` — iframe UI, built from `@ui-organized/react`.

## Develop

```sh
pnpm --filter @ui-organized/figma-component-bridge build      # one-shot
pnpm --filter @ui-organized/figma-component-bridge dev        # watch
pnpm --filter @ui-organized/figma-component-bridge typecheck
```

Then in Figma desktop: **Plugins → Development → Import plugin from manifest…** and pick this folder's `manifest.json`. Figma assigns a plugin `id` for development; a permanent one is added when you publish. Run the plugin, click **Build Button slice**, and inspect the generated variant set's fills — they should show a Variable binding, not a raw color.
