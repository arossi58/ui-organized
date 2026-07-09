# Updating design tokens — a step-by-step guide

This guide explains how to change a design token (a color, a spacing step, a
radius, a font size…) and get that change to show up **everywhere** — the shipped
component library, Storybook, and the theme builder's live preview + export.

If you only remember one thing, remember this:

> ⚠️ **Colors live in two places.** Editing the token JSON updates the shipped
> library but **NOT** the theme builder. Miss the second place and the builder's
> preview/export drifts out of sync with the real components. See
> [The one big idea](#the-one-big-idea-read-this-first).

---

## The one big idea (read this first)

There are **two independent color pipelines**, and a semantic color change must be
written into **both by hand**. They are not generated from each other.

```
                        ┌─────────────────────────────────────────────┐
  PATH A — LIBRARY      │ packages/tokens/src/**/*.json  (DTCG tokens) │
  (what components      │        │  Style Dictionary (config.ts)        │
   actually render)     │        ▼                                      │
                        │ packages/tokens/output/variables.css          │
                        └─────────────────────────────────────────────┘

                        ┌─────────────────────────────────────────────┐
  PATH B — BUILDER      │ packages/utils/src/semanticColorMap.ts (refs) │
  (live preview +       │ packages/utils/src/semanticResolve.ts (alpha) │
   theme export)        │        │  resolveSemanticColors()             │
                        │        ▼                                      │
                        │ builder preview CSS  +  exported theme.css    │
                        └─────────────────────────────────────────────┘
```

- **Primitives, typography, spacing, radius, component tokens** → live **only** in
  Path A. Edit the JSON, rebuild, done. (The builder derives typography/spacing/
  radius from its own scale controls, so it doesn't read these files.)
- **Semantic colors** (`--color-*`) → live in **both**. Edit the JSON **and** the
  matching entry in `packages/utils`. This is the trap.

---

## Where each token lives (Path A — the JSON)

All under `packages/tokens/src/`:

| Token type            | File(s)                                             | Notes                                              |
| --------------------- | --------------------------------------------------- | -------------------------------------------------- |
| Primitive palette     | `primitive/core-color.json`                         | Generated ramps (aqua…waterloo), 24 steps each     |
| Brand alias           | `primitive/brand.json`                              | `brand.*` → `{mars.*}` (the chosen brand family)   |
| Semantic color — dark | `semantic/color-{border,interactive,content,status,surface}.json` | Dark is the **base** (`:root`), because `DEFAULT_THEME="dark"`. (`content` = the merged text+icon foreground group) |
| Semantic color — light| `themes/light/color-*.json`                         | Light is an **override** block (`[data-theme=light]`) |
| Typography            | `typography/{font-families,font-size,line-height,font-weight}.json` | |
| Spacing               | `semantic/spacing.json`                             | |
| Border radius         | `semantic/border-radius.json`                       | |
| Component tokens      | `component/{radius,button,control}.json`            | reference spacing/radius/leading                   |
| Dimension scale       | `semantic/dimension.json`                           | |

> There is **no `themes/dark/` folder**. Dark values are the base `semantic/`
> files; light values are the `themes/light/` overrides. When you change a color,
> decide whether it's a dark change (edit `semantic/`), a light change (edit
> `themes/light/`), or both.

### Value format rules

Raw `$value` literals must be parseable by Style Dictionary's `color/css`
transform:

- ✅ 8-digit hex (`#0202020f`), 6-digit hex, `rgba(2, 2, 2, 0.06)`
- ❌ `color-mix(...)`, relative color (`rgb(from …)`) — these break the build

References use `{family.step}`, e.g. `{grey.1400}`, `{brand.1400}`,
`{crimson.1500}`.

---

## Where each semantic color lives (Path B — the builder)

Only **semantic colors** need this second edit. Two files in `packages/utils/src/`:

| What changed                                   | Edit this                              | How                                                        |
| ---------------------------------------------- | -------------------------------------- | --------------------------------------------------------- |
| A color **reference / shade** (e.g. `grey.1600`→`grey.1400`) | `semanticColorMap.ts`     | Change the value in the `dark` **and/or** `light` block   |
| An **opacity** on an overlay token (ui, secondary, ghost, surface-overlay) | `semanticResolve.ts` → `TOKEN_ALPHA` | Change the decimal alpha. **Mode-independent** — one entry covers both light & dark |

Why the split? Translucent overlay tokens store only their **base color** in
`semanticColorMap.ts` (e.g. `#020202` / `#ffffff`); the alpha is re-applied by
`TOKEN_ALPHA` in `semanticResolve.ts`. So an opacity change never touches the map.

### Hex-alpha ↔ decimal cheat sheet

The JSON uses 8-digit hex; `TOKEN_ALPHA` uses a decimal. `byte = round(alpha × 255)`:

| Alpha | Hex | | Alpha | Hex |
| ----- | --- |-| ----- | --- |
| 0.02  | `05`| | 0.15  | `26`|
| 0.06  | `0f`| | 0.20  | `33`|
| 0.10  | `1a`| | 0.30  | `4d`|
| 0.14  | `24`| | 0.80  | `cc`|

Example: JSON `#0202021a` (light) / `#fcfcfc1a` (dark) ⇄ `TOKEN_ALPHA` `0.1`.

---

## The normal flow

### Step 1 — Decide what's changing

- **Non-color** (spacing/radius/type/component/primitive)? → Path A only. Skip to
  Step 3.
- **Semantic color**? → Path A **and** Path B.

### Step 2 (colors only) — Edit both paths together

1. Edit the JSON in `packages/tokens/src/` (dark in `semantic/`, light in
   `themes/light/`).
2. Mirror it in `packages/utils/src/`:
   - shade/reference change → `semanticColorMap.ts` (matching `dark`/`light` block)
   - opacity change → `TOKEN_ALPHA` in `semanticResolve.ts`

Keep them consistent: the same `--color-*` token should resolve to the same value
on both sides.

### Step 3 — Rebuild the affected packages

```bash
# Path A: regenerate the shipped CSS
pnpm --filter @ui-organized/tokens build:tokens

# Path B: rebuild the resolver (only if you touched packages/utils)
pnpm --filter @ui-organized/utils build

# Storybook is a separate static build — rebuild if you want it current
pnpm --filter @ui-organized/storybook build
```

### Step 4 — Run the tests

```bash
pnpm --filter @ui-organized/tokens test    # transform/buildCss/typography
pnpm --filter @ui-organized/utils test     # resolver/modeGeneration/scales
```

### Step 5 — Verify the two paths agree

Run the [verification script](#appendix-verify-everything-is-in-sync) below. It
should report **zero diffs** between the token JSON and (if you have one) the
builder export `theme-update.json`, and the resolver output should match the JSON.

### Step 6 — See it in a running app

The dev servers **do not watch `node_modules`**, so they keep serving the old
compiled workspace `dist/` until restarted. A browser reload is **not** enough.

```bash
# restart marketing / builder Vite dev server
pnpm dev --force            # or: kill $(lsof -tiTCP:5173) then re-run dev
```

Storybook only updates on its own rebuild + reload (Step 3).

---

## Updating from a theme-builder export (`theme-update.json`)

When someone changes the theme in the builder and exports a DTCG file, don't
eyeball it — **diff it** against the source, because the export uses different
naming and formatting for the *same* values:

| In the export (`theme-update.json`)      | In the source JSON        | Same value? |
| ---------------------------------------- | ------------------------- | ----------- |
| `{primitive.color.neutral.1400}`         | `{grey.1400}`             | ✅ (neutral family = grey) |
| `{primitive.color.brand.1400}`           | `{brand.1400}`            | ✅ (brand alias)           |
| `rgba(2, 2, 2, 0.06)`                     | `#0202020f`               | ✅ (format only)           |
| `primary-selected` (flat key)            | `primary.selected` (nested)| ✅ (format only)          |
| `102.4000015258789px`                    | `102.4px`                 | ✅ (float precision)       |

Only **genuine value changes** matter. Run the verification script to surface them,
then apply each real change to **both paths** per the normal flow.

---

## Gotchas & legacy files (do not edit these)

| File                                             | Why it's a trap                                                                 |
| ------------------------------------------------ | ------------------------------------------------------------------------------- |
| `packages/tokens/src/definitions/semantic-color.ts` | Legacy/unused. References `{black.*}`/`{white.*}` ramps that don't exist in the real JSON. **Not** part of the Style Dictionary build. Editing it changes nothing. |
| `packages/utils/src/modeGeneration.ts` (`generateModes`) | Legacy/unused for color production — only its own test imports it. Different token vocabulary. |
| `semanticColorMap.ts` header says "GENERATED"    | There is **no committed generator**. It's hand-maintained. That's why Path B is a manual second edit. |

---

## Quick reference

```bash
# after editing token JSON
pnpm --filter @ui-organized/tokens build:tokens

# after editing packages/utils (semanticColorMap.ts / semanticResolve.ts)
pnpm --filter @ui-organized/utils build

# tests
pnpm --filter @ui-organized/tokens test
pnpm --filter @ui-organized/utils test

# refresh a running dev server (node_modules isn't watched)
pnpm dev --force
```

**Non-color token:** edit JSON → `build:tokens` → test.
**Semantic color:** edit JSON **+** `packages/utils` → build both → test → verify → restart dev.

---

## Troubleshooting

| Symptom                                                            | Cause & fix                                                                                              |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Components updated, but the **builder preview/export** still shows the old color | You edited Path A only. Mirror the change in `packages/utils` (`semanticColorMap.ts` / `TOKEN_ALPHA`) and `pnpm --filter @ui-organized/utils build`. |
| An **opacity** change didn't take in the builder                  | Opacity lives in `TOKEN_ALPHA` (`semanticResolve.ts`), not in `semanticColorMap.ts`. Edit there.        |
| `build:tokens` fails / a value is skipped                         | A `$value` uses `color-mix`/relative color. Use 8-digit hex or `rgba()`.                                 |
| Dev server still shows old values after rebuild                   | Vite doesn't watch `node_modules`. Restart with `pnpm dev --force` (browser reload isn't enough).       |
| Changed a color but nothing changed in dark **or** light          | Dark = `semantic/`, light = `themes/light/`. You edited the wrong layer (or need both).                 |
| Storybook still stale                                             | It's a separate static build. `pnpm --filter @ui-organized/storybook build` and reload.                 |

> Shipping these changes to npm is a **separate** step — see [RELEASING.md](RELEASING.md).
> A token edit isn't published until `@ui-organized/tokens` (and `@ui-organized/utils`,
> if touched) get a version bump and release.

---

## Appendix: verify everything is in sync

Save as `scripts/verify-tokens.mjs` (or paste into `node --input-type=module`).
Run from the repo root. Reports semantic-color diffs between the builder export and
the source JSON; prints `✅` when clean.

```js
import fs from "fs";
const EXPORT = "theme-update.json";              // a builder export, if you have one
const R = "packages/tokens/src";
const groups = ["border", "interactive", "content", "status", "surface"];
const tu = JSON.parse(fs.readFileSync(EXPORT, "utf8"));
const cur = (theme, g) => JSON.parse(fs.readFileSync(
  theme === "dark" ? `${R}/semantic/color-${g}.json` : `${R}/themes/light/color-${g}.json`,
  "utf8"))[`color-${g}`];

function flat(o, p = "", out = {}) {
  if (o && o.$value !== undefined) { out[p] = o.$value; return out; }
  for (const [k, v] of Object.entries(o || {})) {
    if (k.startsWith("$")) continue;
    flat(v, p ? `${p}-${k}` : k, out);
  }
  return out;
}
// Normalize away format differences (neutral↔grey, primitive.color. prefix, hex8↔rgba, precision).
function n(v) {
  if (typeof v !== "string") return String(v);
  let s = v.trim(), m;
  if ((m = s.match(/^\{(.+)\}$/)))
    return "{" + m[1].replace(/^primitive\.color\./, "").replace(/^neutral\./, "grey.") + "}";
  if ((m = s.match(/^#([0-9a-f]{6})([0-9a-f]{2})$/i)))
    return "#" + m[1].toLowerCase() + "@" + (parseInt(m[2], 16) / 255).toFixed(2);
  if ((m = s.match(/^#([0-9a-f]{6})$/i))) return "#" + m[1].toLowerCase() + "@1.00";
  if ((m = s.match(/^rgba?\(([^)]+)\)$/))) {
    const p = m[1].split(",").map(x => x.trim());
    const a = p[3] !== undefined ? parseFloat(p[3]) : 1;
    return "#" + p.slice(0, 3).map(x => (+x).toString(16).padStart(2, "0")).join("") + "@" + a.toFixed(2);
  }
  return s.toLowerCase();
}
const diffs = [];
for (const theme of ["light", "dark"])
  for (const g of groups) {
    const A = flat(tu.color[theme][g]), B = flat(cur(theme, g));
    for (const k of new Set([...Object.keys(A), ...Object.keys(B)]))
      if (n(A[k]) !== n(B[k]))
        diffs.push(`[${theme}/${g}] ${k}: EXPORT ${A[k] ?? "(absent)"} <- SOURCE ${B[k] ?? "(absent)"}`);
  }
console.log(diffs.length ? "DIFFS (" + diffs.length + "):\n" + diffs.join("\n")
                         : "✅ token JSON matches the export — in sync.");
```

To also confirm **Path B** (the resolver) agrees, resolve the default theme and spot-check a token:

```js
import { resolveSemanticColors, getCoreFamily } from "./packages/utils/dist/index.mjs";
const out = resolveSemanticColors("dark", {
  brandRamp: getCoreFamily("mars"),
  neutralRamp: getCoreFamily("grey"),
  brandShade: "1400",
});
console.log(out["--color-content-secondary"]); // should equal grey.1100 = #c0c0c0
```
