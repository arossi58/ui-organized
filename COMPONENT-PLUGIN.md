# UI Organized — Figma Component Bridge — Build Plan

A plugin that reads the `@ui-organized/react` component library in this monorepo, lets you pick a component, and generates a Figma component with its props, variants, states, layout, and design tokens — with a manual resolution step wherever the pipeline can't decide for itself.

The whole plan rests on one idea: **the intermediate Spec JSON is the contract.** The plugin never reads your code. A companion service reads code, renders it, and emits a normalized spec; the plugin only knows how to turn that spec into Figma nodes. Keeping that boundary clean is what makes the thing maintainable and testable.

This is a sibling to the existing `tooling/figma-plugin` ("UI Organized – Theme Import"), which already imports the design tokens into Figma Variables. That plugin is the precedent: mirror its esbuild build, its `manifest.json` shape, its `postMessage` protocol, and its habit of dogfooding `@ui-organized/react` for the plugin UI. Crucially, it has **already done most of Phase 1** — the Figma Variable collections this plugin binds to are the ones it creates.

---

## 1. Architecture

```
packages/react   (@ui-organized/react — standalone React + Ark UI + TS prop interfaces)
packages/tokens  (@ui-organized/tokens — Style Dictionary → CSS custom properties)
apps/storybook   (Storybook 10 + react-vite, existing stories + Playwright VR harness)
        │
        ▼
COMPANION SERVICE  (Node + TS, runs locally via pnpm/npx or in CI)
  ├─ Analyzer    ts-morph + TS compiler API   → Component Manifest (prop schema)
  ├─ Renderer    Storybook + Playwright        → DOM + computed styles + resolved --color-* vars
  └─ Normalizer  DOM → Spec JSON               → the contract
        │
        │  localhost:PORT  (WS/HTTP)  ── or ──  pre-generated specs fetched from GitHub
        ▼
FIGMA PLUGIN  (tooling/figma-component-bridge — new, esbuild-built like tooling/figma-plugin)
  ├─ UI thread (iframe)   selection · resolution queue · progress   (does the network calls)
  └─ Main thread (sandbox) Builder: createComponent · properties · bind Variables · combineAsVariants

Foundation:  Token Name Map   (CSS custom property ↔ Figma Variable, name-matched to the
                               Primitives/Semantic/Scale/Typography collections the Theme
                               Import plugin already creates)
Memory:      Resolution Map    (versioned JSON in repo; remembers your manual choices)
```

**Why a companion service and not a pure plugin.** The Figma sandbox can't execute a browser, and a component's *visual* output only exists once React renders it with real props. So rendering happens outside Figma. The service runs local-first, with a GitHub-artifact fetch mode as the offline/CI fallback. The plugin UI iframe can `fetch` `localhost`, so live selection works without anything hosted.

**Two non-negotiables for "bulletproof":**
- **Determinism** — same source + same Resolution Map → byte-identical Spec → identical Figma output. Hash each component's source + resolutions so you can detect drift and support update-mode diffing.
- **Graceful degradation** — every stage that can't decide emits an `unresolved` record into the spec rather than guessing silently. The plugin turns those into a review queue. (The Theme Import plugin already follows this pattern — it accumulates a `warnings[]` instead of throwing; carry that forward.)

---

## 2. The Spec JSON contract

Freeze this early; everything upstream and downstream negotiates through it. Sketch, using the real `Button` (`packages/react/src/components/Button`):

```jsonc
{
  "component": "Button",
  "source": { "file": "packages/react/src/components/Button/Button.tsx", "hash": "sha256:…" },
  "propertyDefinitions": {
    "intent":   { "type": "VARIANT", "values": ["primary","secondary","tertiary","ghost","destructive","destructive-ghost"], "default": "primary" },
    "size":     { "type": "VARIANT", "values": ["sm","md","lg"], "default": "md" },
    "disabled": { "type": "BOOLEAN", "default": false },
    "children": { "type": "TEXT", "default": "Button" },
    "icon":     { "type": "INSTANCE_SWAP", "default": null }
  },
  "states": ["default","hover","focus","active","disabled"],
  "variants": [
    {
      "props": { "intent": "primary", "size": "md", "state": "default" },
      "tree": {
        "name": "root",
        "layout": { "mode": "HORIZONTAL", "padding": [8,16,8,16], "gap": 4, "align": "CENTER" },
        "box": { "radius": "{--radius-interactive}", "fill": "{--color-interactive-primary-default}" },
        "children": [
          { "name": "label", "type": "TEXT", "text": "Button",
            "typography": { "family": "{--font-family-sans}", "size": "{--font-size-md}", "color": "{--color-interactive-contents}" } }
        ]
      }
    }
    // … one entry per emitted prop+state combination
  ],
  "unresolved": [
    { "id": "u1", "kind": "TOKEN_NO_MATCH", "where": "root.box.fill",
      "found": "rgb(0,82,204)", "candidates": ["Semantic:interactive/primary/default", "Semantic:interactive/primary/hover"] }
  ]
}
```

Rules that keep it bulletproof:
- **Token references stay symbolic.** Emit `{--color-interactive-primary-default}`, never the resolved `rgb()`. The plugin binds to a Figma Variable by name; resolved values are only a fallback when no Variable matches.
- **Layout is already Figma-shaped.** The normalizer does the flexbox→auto-layout translation (the components are `inline-flex` / `flex`, so this is the clean path), so the plugin stays dumb. Anything that *can't* map to auto-layout becomes an `unresolved` record, not a silent approximation.
- **State is a pseudo-axis.** Treat `state` like a variant property during capture; you decide later whether it becomes a real Figma variant axis or separate components. (Component CSS keys states off `:hover` / `:active` / `:focus-visible` / `:disabled` + `[data-*]`, so they're forceable — see §5.)

---

## 3. Phases

Sequenced by **risk, not by feature order.** Prove the scariest link first.

### Phase 0 — Vertical slice (de-risk the Figma contract)
Goal: one component, one variant axis, one token, end to end — with the Spec JSON *hand-written*. No analyzer, no renderer yet.
- Hand-author a spec for `Button` (primary/secondary, the `--color-interactive-primary-default` token).
- Build the plugin Builder: `createComponent()` → property definitions → `setBoundVariable()` for the fill → `combineAsVariants()`.
- Resolve the token symbolically against the **Semantic** collection variable `interactive/primary/default` — the one the Theme Import plugin already creates. Looking up a Variable by name reuses the indexing pattern in that plugin's `importTheme.ts`.
- **Exit criteria:** a real Figma variant set whose fill is bound to a live `interactive/*` Variable. If this works, the rest is plumbing into a contract you've proven.

### Phase 1 — Token foundation
Goal: the Style Dictionary graph exists as Figma Variables, with a canonical name map. **Most of this already ships** in `tooling/figma-plugin`.
- The Theme Import plugin already emits Figma Variables across **Primitives**, **Semantic** (Light/Dark modes), **Scale**, **Typography**, and **Icons** collections, name-matched (e.g. `interactive/primary/default`, `text/primary`, `radius/…`, `spacing/…`, `component/…`). Reuse those collections; don't recreate them.
- Lock the **Token Name Map**: CSS custom property ↔ Figma Variable, e.g. `--color-interactive-primary-default` ↔ `Semantic : interactive/primary/default`. The mapping bridges three notations — CSS dash (`--color-interactive-primary-default`), DTCG dot path (`color-interactive.primary.default`), and Figma slash path (`interactive/primary/default`) — so generate it from `packages/tokens/src/definitions/*` (the single source the CSS build and the Theme Import plugin both derive from) rather than string-munging dashes, which is ambiguous.
- Modes (light/dark) already exist as Variable modes on the Semantic collection. Density/other axes: model as collections/modes now — retrofitting later is painful.
- **Exit:** binding in Phase 0 resolves by name with zero manual mapping; re-importing tokens stays idempotent (the importer already updates-in-place).

### Phase 2 — Static analysis → Component Manifest
Goal: discover components and their prop schema; populate the "select a component" list. No rendering.
- ts-morph + the TS compiler API to read each component's exported props interface (e.g. `ButtonProps`), including `React.ComponentPropsWithRef<"button">` host props, `children`, callback props (`onX`), and `render`/slot props.
- Map types to property kinds: **string-union → VARIANT axis** (`intent`, `size`, `iconPosition`), **boolean → BOOLEAN**, **`children`/`render` slot → INSTANCE_SWAP or SLOT**, **string content → TEXT**, **`CanonicalIconName` → INSTANCE_SWAP (icon set)**. These are *guesses* — every one is overridable in Phase 5.
- Emit per-component prop schema + a stable source hash.
- **Exit:** plugin shows all ~47 components (`packages/react/src/components/*`) with their inferred prop axes; nothing rendered yet.

### Phase 3 — Render + Spec generation
Goal: turn a selected component into real Spec JSON. This is the fidelity-critical phase.
- Drive variant enumeration off **Storybook `argTypes`** from the existing CSF stories in `apps/storybook` — far more reliable than pure static inference for which combinations are *valid*. Fall back to the cartesian product of Phase 2 axes (capped) when no story exists.
- Playwright renders each combination against the built Storybook (`storybook build` → static, the same artifact the VR harness uses). Force pseudo-states (`:hover`, `:focus-visible`, `:active`, `:disabled`) via CDP so states are capturable, not just theoretical.
- Per node, capture computed styles **and** which `--color-*` / `--radius-*` / `--spacing-*` custom properties actually resolved (walk `getComputedStyle` for the custom-property names, not just final values — that's how token references survive into the spec).
- Normalizer walks the DOM → Spec JSON: flex→auto-layout, box model, typography, fills/strokes/effects, symbolic token refs.
- Start with `Button`; generalize to a second, structurally different component (e.g. `Input`/`Field`, or `Card` with projected `children`) before declaring the normalizer done.
- **Exit:** generated spec for two dissimilar components builds correctly through the Phase 0 Builder.

### Phase 4 — Plugin build engine
Goal: the Builder handles the full spec, not just the hand-written slice.
- Full node construction (frames, text, auto-layout, strokes, effects, radius).
- Apply `componentPropertyDefinitions` for all kinds; wire TEXT/BOOLEAN/INSTANCE_SWAP props to the right nodes.
- Bind every symbolic token ref to its Variable by name via the Token Name Map; record a miss as `TOKEN_NO_MATCH` rather than hardcoding the value.
- Assemble the variant set with `combineAsVariants()`; lay it out in a tidy grid.
- **Exit:** select component → full variant set with bound tokens, no manual steps when everything resolves.

### Phase 5 — Resolution UX (the manual fallback)
Goal: anything the pipeline couldn't decide becomes a reviewable, persistent choice. This is what makes the plugin trustworthy.
- The UI shows a **Resolution Queue** before the build runs: each `unresolved` record renders as a card with *what was found*, *candidate options*, and a dropdown or free input. Build the UI from `@ui-organized/react` (`Alert`, `Button`, `Select`, `TextArea`, …) exactly as the Theme Import plugin does.
- Resolution kinds and their UI (see §4).
- Persist choices to a **Resolution Map** keyed by `component + stable node path + kind`. Store it as versioned JSON in the repo (same GitHub-backed pattern as the marketing site's Class Manager storage), so resolutions are shared and reviewed in PRs.
- On re-run, pre-apply remembered resolutions; only genuinely new ambiguities surface. The pipeline **converges** instead of re-asking every time.
- **Exit:** a component with grid layout + a non-matching token can be fully built after a few manual picks, and a second run asks nothing.

### Phase 6 — Scale + update mode
Goal: all ~47 components, and keep Figma in parity as code changes.
- **Update mode:** re-generate spec → diff against the existing Figma component by stable node naming → patch deltas instead of recreating. This is the parity-maintenance payoff.
- Source-hash drift detection: flag components whose code changed since last generation.
- Batch generation + a CI job (the repo already runs turbo/CI) that regenerates specs on merge so the GitHub-fetch mode is always current.
- Visual regression: export the built Figma component to PNG, compare against the Playwright screenshot of the rendered DOM. The `apps/storybook` Playwright VR harness (`test:visual`) is the natural home — reuse its snapshot conventions.

---

## 4. Resolution taxonomy

Every category the pipeline can't auto-decide, and how the user resolves it. Each emits an `unresolved` record; each has a remembered answer in the Resolution Map.

| Kind | Trigger | User action |
|---|---|---|
| `TOKEN_NO_MATCH` | Computed value looks tokenized but no `--color-*`/`--radius-*`/`--spacing-*` var resolved, or a var name has no matching Figma Variable | Pick a Variable, or accept the raw value |
| `LAYOUT_UNMAPPABLE` | CSS grid, absolute positioning, transforms, pseudo-elements — no auto-layout equivalent | Choose an approximation strategy, or mark the node manual |
| `STATE_UNCAPTURABLE` | A state can't be force-triggered headlessly (JS-driven, `aria-*`/`data-*`-gated by an Ark primitive) | Input how to trigger it, or supply the resolved styles |
| `PROP_KIND_AMBIGUOUS` | A string prop could be a VARIANT axis, a TEXT property, or just a class toggle | Confirm the property kind |
| `SLOT_DEFAULT` | A `children`/`render` slot needs a default instance for INSTANCE_SWAP | Pick the component that fills the slot |
| `AXIS_SELECTION` | Too many axes → combinatorial blowup (`Button` alone is 6 intents × 3 sizes × 5 states = 90) | Toggle which props are real variant axes vs. a single canonical state |

`AXIS_SELECTION` is worth surfacing *up front*, before rendering — every boolean axis doubles the variant count, so capping axes early keeps Phase 3 fast and the variant set legible.

---

## 5. Known-lossy edges (decide the convention now)

- **Flex → auto-layout:** clean — the components use `inline-flex`/`flex` with gap and padding tokens. Grid, absolute, sticky: no equivalent → `LAYOUT_UNMAPPABLE`.
- **Pseudo-states:** force via CDP where possible. The component CSS keys off `:hover` / `:active` / `:focus-visible` / `:disabled`, which CDP can force; Ark-driven `[data-state]` / `aria-*` toggles that need JS go to `STATE_UNCAPTURABLE`.
- **Pseudo-elements (`::before`/`::after`):** often decorative; default to "render as a node," allow "ignore."
- **Media queries / responsive:** Figma has no breakpoints; capture at a canonical viewport and treat other breakpoints as separate variants only if you opt in.
- **Animation/transition:** out of scope for static components; the `transition` declarations on the components are ignored.

Your setup is unusually favorable here — from-scratch scoped component CSS with disciplined `--color-*` / `--radius-*` / `--spacing-*` token usage is exactly the condition under which DOM→Figma stays accurate. The thing that wrecks these pipelines is messy third-party CSS, which you don't have.

---

## 6. Stack

- **Companion service:** Node + TypeScript, ts-morph (or the TS compiler API), Playwright, Storybook (reuse the existing `apps/storybook` stories + its build), Fastify/WS for transport.
- **Plugin:** TypeScript, Figma Plugin API (`createComponent`, `componentPropertyDefinitions`, `setBoundVariable`, `combineAsVariants`), **esbuild-built** to match `tooling/figma-plugin` (`build.mjs`, two artifacts: sandbox `dist/code.js` + inlined `dist/ui.html`). UI dogfoods `@ui-organized/react` + `@ui-organized/tokens/variables.css`. Reuse the existing plugin's `color.ts` (`parseColor` / `rgbaToCss` / `toFloat`). Manifest `networkAccess.allowedDomains` lists `https://raw.githubusercontent.com`; the local companion service goes in **`devAllowedDomains`** (`http://localhost:*`) — Figma rejects `localhost` in `allowedDomains`. Set `documentAccess: "dynamic-page"` (so use the async variable/collection getters, as the Theme Import plugin does).
- **Storage:** Resolution Map + Token Name Map as JSON in the repo; CI-generated specs published as a GitHub release artifact for offline mode.

---

## 7. Testing — how you prove "bulletproof"

- **Golden-file tests on Spec JSON** — analyzer/normalizer output is committed; diffs are reviewed, not silently accepted. (Vitest is already the repo's test runner; `packages/tokens` has the precedent.)
- **Builder unit tests** against hand-authored specs covering each property kind and each resolution path.
- **Visual regression** (Phase 6) — rendered-DOM PNG vs. Figma-export PNG, per variant, inside the existing `apps/storybook` Playwright harness. This is the real proof of fidelity.
- **Idempotency tests** — generate twice, assert identical output; bind tokens twice, assert no duplicate Variables.

---

## 8. Reference prior art

- **`tooling/figma-plugin` (in this repo)** — the closest precedent: esbuild build, `manifest.json`, sandbox↔iframe `postMessage` protocol, name-matched Variable indexing (`importTheme.ts`), color parsing (`color.ts`), and a UI built from `@ui-organized/react`. Read it before writing anything.
- **`html.to.design`** — proves the DOM-import path end to end; it's essentially this minus the variant enumeration, state forcing, and token binding you're adding. Study its node-mapping choices before writing the normalizer.

---

## Critical path, in order

**0 (slice) → 1 (tokens — mostly done) → 2 (manifest) → 3 (render/spec) → 4 (builder) → 5 (resolution) → 6 (scale/update).**
Don't touch all ~47 components until Phase 3's normalizer survives two structurally different components. The single highest-leverage early decision is freezing the Spec JSON schema in §2 — everything else negotiates through it.
