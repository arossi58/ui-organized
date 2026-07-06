# @ui-organized/storybook-inspector

A Storybook addon ([INSPECTOR.md](../../INSPECTOR.md)) — a **Figma-style properties
panel** that drives the **real, live-rendered** Storybook component via args. It
reads "what properties exist and what they're called" from the **same
`manifest/components.json`** the Code Connect MCP server reads, so there's one shared
source of truth instead of a per-tool prop schema.

## Inspect (Figma Dev-Mode view)

The panel leads with a **live inspection of the actual rendered story DOM** (read from
the same-origin preview iframe, re-run on every render / args change):

- **Element + class tree** — every div/container with its `tag.classNames`, selectable.
- **Variables applied** — for the selected element, the design-token CSS variables in
  effect (e.g. `color → --color-interactive-primary-default`), with a color swatch and
  the resolved value. This is extracted from the matched CSS rules, so it's what's
  *actually* applied, not a guess.
- **Typography** — font family / size / weight / line-height / letter-spacing, plus the
  `text-*` utility class in use.
- **Icon** — for `<svg>` nodes: size, stroke-width, stroke, fill.
- **Layout** — display, padding, gap, radius.

Below that, the manifest-driven **Args (live)** controls remain (variant pills / toggles
/ inputs) — still real `useArgs` writes.

## What it does

- **Real render, not simulation** — every control writes through Storybook's
  `useArgs()`, so the actual component re-renders with the real prop change.
- **Reads as Figma's panel** — variant **pill groups**, boolean **toggles**, text
  inputs (debounced 300ms), numeric **steppers**, collapsible grouped sections;
  11px labels, dense rows (see [figma-tokens.css](src/figma-tokens.css)).
- **One manifest, two consumers** — resolution, search, staleness, and prop-diff all
  come from `@ui-organized/code-connect/browser` (the shared core), not a reimplemented
  copy. If the AI-facing and human-facing tools computed confidence/staleness
  differently they'd erode trust in both; the import graph prevents that (§6).
- **Drift is visible per row** — if a story's `argTypes` disagree with the manifest
  (`missing-in-story`, `options-mismatch`), the specific row shows a ⚠, not just a
  global banner (§4).
- **Never blocks** — a story with no manifest match still renders; the panel shows an
  **Unmapped** state with a search + copy-paste `parameters.figmaCodeConnect` snippet
  to link it (§7). Stale/deprecated stay fully functional with a banner.

## Linking a story to a component (§3)

```ts
// Button.stories.ts — explicit, confidence: "exact"
export default {
  title: "Components/Button",
  component: Button,
  parameters: { figmaCodeConnect: { componentKey: "…" } },
};
```

Without the parameter, the panel falls back to a **name/path similarity** match
(`confidence: "fuzzy"`, using the MCP server's `similarity` + threshold) — never
silently promoted to `exact`.

## Architecture

| File | Realm | Responsibility |
| --- | --- | --- |
| [controls.ts](src/controls.ts) | pure | classify a manifest prop → Figma control kind |
| [manifest-resolver.ts](src/manifest-resolver.ts) | pure | story → manifest entry (explicit → fuzzy → none) |
| [arg-drift.ts](src/arg-drift.ts) | pure | per-prop story-vs-manifest drift |
| [manifest-source.ts](src/manifest-source.ts) | manager | fetch the served manifest + latest-scan |
| [hooks/useManifestEntry.ts](src/hooks/useManifestEntry.ts) | manager | resolve current story + staleness (shared core) + drift |
| [hooks/useLiveArgs.ts](src/hooks/useLiveArgs.ts) | manager | thin wrapper over Storybook `useArgs` |
| [Panel.tsx](src/Panel.tsx) + [components/](src/components/) | manager | the Figma-shaped panel |
| [manager.tsx](src/manager.tsx) | manager | registers the panel |
| [preset.ts](preset.ts) | node | packaged wiring (managerEntries + staticDirs) |

## Wiring (already done in this repo)

`apps/storybook/.storybook/manager.ts` imports `@ui-organized/storybook-inspector/manager`,
and `main.ts` serves the manifest via `staticDirs → /inspector-manifest`. Rebuild the
addon after changing it:

```bash
pnpm --filter @ui-organized/storybook-inspector build   # → dist/manager.js
pnpm --filter @ui-organized/storybook-inspector test
pnpm --filter @ui-organized/storybook  dev              # open Storybook, see the "Inspector" panel
```

The pure logic is unit-tested; the live-render behavior is verified interactively in
Storybook (and gated by `storybook build` succeeding with the addon registered).
