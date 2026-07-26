/**
 * Builds the portable theme config from builder state.
 *
 * The canonical artifact is a single **DTCG** (`$type`/`$value`) `theme.json`
 * that captures every parameter — the same token format the design system's own
 * `@ui-organized/tokens` are authored in, so it imports straight into code build
 * pipelines (Style Dictionary) and Figma (Tokens Studio plugin / Variables API).
 *
 * From that one source we also emit the derived web stylesheet (`theme.css`) and
 * a runtime `IconProvider` snippet (`icons.ts`) — icons are React context, not a
 * CSS variable or a Figma variable type, so they ride alongside the tokens in the
 * document's `$extensions` and are applied in code via the snippet.
 */

import {
  computeTypographyVars,
  computeSpacingVars,
  computeRadiusVars,
  computeComponentTokenVars,
  computeControlHeightVars,
  type CSSVarMap,
} from "./semanticMapping";
import { dimensionTokens } from "@ui-organized/tokens";
import { listPhrase, normalizeWeights, unservableWeights } from "../hooks/useGoogleFonts";
import { fontLinkTags, resolveThemeFonts } from "./buildFonts";
import { resolveSemanticRefs, getCoreFamily, type SemanticRef, type ColorRamp } from "@ui-organized/utils";
import type { BuilderState, IconLibrary } from "../state/themeState";

// ─── DTCG token primitives ──────────────────────────────────────────────────────

type DtcgType = "color" | "dimension" | "fontFamily" | "fontWeight";
interface DtcgToken {
  $type: DtcgType;
  $value: string | number;
}
type DtcgGroup = { [key: string]: DtcgToken | DtcgGroup };

/** npm package that ships each icon library — surfaced in the README + snippet. */
const ICON_PACKAGES: Record<IconLibrary, string> = {
  lucide: "lucide-react",
  tabler: "@tabler/icons-react",
  heroicons: "@heroicons/react",
};

// ─── Color: reference-preserving semantic tokens + primitive layer ──────────────

/** A semantic token's `$value`: a DTCG reference to its primitive, or a raw literal. */
function refValue(ref: SemanticRef): string {
  return ref.kind === "alias"
    ? `{primitive.color.${ref.group}.${ref.step}}`
    : ref.value;
}

/**
 * Turn a `{ "--color-surface-base": <SemanticRef> }` map into a nested group
 * keyed by category, e.g. `surface.base`. The bare `--brand` token maps to
 * `brand`. Each leaf `$value` is a DTCG alias `{primitive.color.…}` when the
 * token references a primitive, or a raw `#hex`/`rgba()` literal otherwise —
 * mirroring the semantic taxonomy of the shipped color tokens.
 */
function colorTokensFromRefs(refs: Record<string, SemanticRef>): DtcgGroup {
  const group: DtcgGroup = {};
  for (const [cssVar, ref] of Object.entries(refs)) {
    const name = cssVar.replace(/^--/, "");
    const token: DtcgToken = { $type: "color", $value: refValue(ref) };

    if (!name.startsWith("color-")) {
      // Bare tokens like `brand` sit at the top of the mode group.
      group[name] = token;
      continue;
    }

    const rest = name.slice("color-".length);
    const dash = rest.indexOf("-");
    if (dash === -1) {
      group[rest] = token;
      continue;
    }
    const category = rest.slice(0, dash);
    const leaf = rest.slice(dash + 1);
    const bucket = (group[category] ??= {}) as DtcgGroup;
    bucket[leaf] = token;
  }
  return group;
}

/**
 * The `primitive.color` layer — for every color family the theme *uses* (any
 * semantic token aliases at least one of its steps), the **full** ramp is
 * emitted, not just the referenced steps: if a swatch is in play, designers get
 * all 24 shades to work with in Figma. Only families that go unused are dropped,
 * so the export still ships a relevant subset of the 37-family library rather
 * than everything.
 *
 * Groups: `brand`, `neutral` (the swappable roles, resolved from the chosen
 * ramps) and the fixed functional families (`lima`, `cerulean`, `crimson`, …,
 * resolved from their core ramp). Steps carry the resolved hex, which the
 * semantic tokens reference as `{primitive.color.<group>.<step>}`.
 */
function buildPrimitiveColors(
  modes: Record<string, SemanticRef>[],
  rampFor: (group: string) => ColorRamp | undefined,
): DtcgGroup {
  const usedGroups = new Set<string>();
  for (const refs of modes) {
    for (const ref of Object.values(refs)) {
      if (ref.kind === "alias") usedGroups.add(ref.group);
    }
  }

  const color: DtcgGroup = {};
  for (const group of [...usedGroups].sort()) {
    const ramp = rampFor(group);
    if (!ramp) continue;
    const g: DtcgGroup = {};
    for (const step of Object.keys(ramp).sort((a, b) => Number(a) - Number(b))) {
      const hex = ramp[step]?.hex;
      if (hex) g[step] = { $type: "color", $value: hex };
    }
    color[group] = g;
  }
  return { color };
}

// ─── Typography ─────────────────────────────────────────────────────────────────

function typographyTokens(state: BuilderState): DtcgGroup {
  // Reuse the exact same computation the CSS export uses, so JSON ↔ CSS agree.
  const vars = computeTypographyVars(
    state.headingFamily,
    state.bodyFamily,
    state.headingWeights,
    state.bodyWeights,
    state.typeScaleSteps,
    state.leadingSteps,
  );

  const size: DtcgGroup = {};
  const leading: DtcgGroup = {};
  for (const [cssVar, value] of Object.entries(vars)) {
    if (cssVar.startsWith("--type-size-")) {
      size[cssVar.slice("--type-size-".length)] = { $type: "dimension", $value: value };
    } else if (cssVar.startsWith("--type-leading-")) {
      leading[cssVar.slice("--type-leading-".length)] = { $type: "dimension", $value: value };
    }
  }

  const weightToken = (n: number): DtcgToken => ({ $type: "fontWeight", $value: n });

  return {
    font: {
      heading: { $type: "fontFamily", $value: state.headingFamily },
      body: { $type: "fontFamily", $value: state.bodyFamily },
    },
    weight: {
      "heading-default": weightToken(state.headingWeights.default ?? 400),
      "heading-emphasis": weightToken(state.headingWeights.emphasis ?? 500),
      "heading-strong": weightToken(state.headingWeights.strong ?? 600),
      "heading-heavy": weightToken(state.headingWeights.heavy ?? 700),
      "body-default": weightToken(state.bodyWeights.default ?? 400),
      "body-emphasis": weightToken(state.bodyWeights.emphasis ?? 500),
      "body-strong": weightToken(state.bodyWeights.strong ?? 600),
      "body-heavy": weightToken(state.bodyWeights.heavy ?? 700),
    },
    size,
    leading,
  };
}

// ─── Spacing / radius / component aliases ───────────────────────────────────────

function dimensionTokensFromMap(map: CSSVarMap, stripPrefix: string): DtcgGroup {
  const group: DtcgGroup = {};
  for (const [cssVar, value] of Object.entries(map)) {
    group[cssVar.replace(/^--/, "").replace(stripPrefix, "")] = {
      $type: "dimension",
      $value: value,
    };
  }
  return group;
}

/**
 * Component-level aliases → `radius.*` / `button.*` / `control-height.*`.
 * `control-height` keeps the word "height" so the Figma importer scopes the
 * variable to WIDTH_HEIGHT.
 */
function componentTokens(state: BuilderState): DtcgGroup {
  const vars = {
    ...computeComponentTokenVars(state.borderRadius, state.spacingScale),
    ...computeControlHeightVars(state.leadingSteps, state.spacingScale),
  };
  const radius: DtcgGroup = {};
  const button: DtcgGroup = {};
  const controlHeight: DtcgGroup = {};
  for (const [cssVar, value] of Object.entries(vars)) {
    const name = cssVar.replace(/^--/, "");
    const token: DtcgToken = { $type: "dimension", $value: value };
    if (name.startsWith("control-height-")) {
      controlHeight[name.slice("control-height-".length)] = token;
    } else if (name.startsWith("radius-")) {
      radius[name.slice("radius-".length)] = token;
    } else if (name.startsWith("Button-")) {
      button[name.slice("Button-".length).toLowerCase()] = token;
    }
  }
  return { radius, button, "control-height": controlHeight };
}

// ─── Theme JSON (DTCG document) ─────────────────────────────────────────────────

export function buildThemeTokens(state: BuilderState): Record<string, unknown> {
  const colorOpts = {
    brandRamp: state.brandRamp,
    neutralRamp: state.neutralRamp,
    brandShade: state.brandShade,
  };

  // Reference-preserving semantic colors per mode — `alias` tokens keep their
  // link to a primitive step; `raw` tokens are literals with no primitive.
  const light = resolveSemanticRefs("light", colorOpts);
  const dark = resolveSemanticRefs("dark", colorOpts);

  // Full ramp per primitive group: brand/neutral track the chosen ramps; every
  // other (functional) group resolves to its fixed core family.
  const rampFor = (group: string): ColorRamp | undefined =>
    group === "brand" ? state.brandRamp : group === "neutral" ? state.neutralRamp : getCoreFamily(group);

  return {
    $description: `${state.themeName || "My Theme"} — exported from the Design System Theme Builder`,
    $extensions: {
      "com.ui-organized.theme-builder": {
        themeName: state.themeName || "My Theme",
        brand:
          state.brandMode === "custom"
            ? { mode: "custom", hex: state.brandHex, primaryShade: state.brandShade }
            : { mode: "family", family: state.brandFamily, primaryShade: state.brandShade },
        neutral: { family: state.neutralFamily },
        typeScale: { base: state.typeScaleBase, ratio: state.typeScaleRatio, mode: state.typeScaleMode },
        // Parametric inputs the resolved token tree can't fully express — kept so
        // the theme can be loaded *back* into the builder exactly (and survives a
        // Figma round-trip via the plugin, which stashes this whole block). `mode`
        // records whether the scale/leadings are the design-system defaults
        // ("system") or user-customized ("custom").
        lineHeight: { heading: state.headingLineHeight, body: state.bodyLineHeight, mode: state.lineHeightMode },
        radius: { base: state.radiusBase },
        spacing: { baseUnit: state.spacingBaseUnit },
        // Icons are runtime React config (IconProvider), not a CSS/Figma variable
        // type — captured here and emitted as icons.ts for code consumers.
        icons: { ...state.icons, package: ICON_PACKAGES[state.icons.library] },
        // Which mode the derived stylesheet puts on bare `:root`. A CSS-emit
        // concern with no token of its own, so it lives here and round-trips.
        exportDefaultMode: state.exportDefaultMode,
        // Font provenance. `type.font.*` already names the families, but not that
        // they're Google Fonts nor which weights each one actually ships — and
        // without that a consumer can't load them, and we can't tell them which
        // of their weights the browser will be synthesising.
        fonts: {
          provider: "google",
          heading: {
            family: state.headingFamily,
            weights: normalizeWeights(Object.values(state.headingWeights)),
            available: normalizeWeights(state.headingFontAvailable),
          },
          body: {
            family: state.bodyFamily,
            weights: normalizeWeights(Object.values(state.bodyWeights)),
            available: normalizeWeights(state.bodyFontAvailable),
          },
        },
      },
    },
    // Full ramps for every color family this theme uses — the alias targets
    // below. Maps to a single-mode "Primitives" variable collection in Figma.
    primitive: buildPrimitiveColors([light, dark], rampFor),
    color: {
      // Two modes — map these to a "Semantic" collection's Light/Dark modes;
      // each token aliases a primitive (or carries a raw literal).
      light: colorTokensFromRefs(light),
      dark: colorTokensFromRefs(dark),
    },
    type: typographyTokens(state),
    spacing: dimensionTokensFromMap(computeSpacingVars(state.spacingScale), "spacing-"),
    "border-radius": dimensionTokensFromMap(computeRadiusVars(state.borderRadius), "border-radius-"),
    component: componentTokens(state),
    // Fixed layout sizes (`--dimension-01…12`). Not builder-controlled, but the
    // component CSS reads them — `--dimension-06` is the sidebar rail — so the
    // export has to carry them or a theme is quietly incomplete. The z-index
    // scale is deliberately CSS-only: stacking order has no Figma equivalent.
    // Key order here is JS's, not ours: "10".."12" are valid array indices, so
    // they hoist ahead of "01".."09" no matter how the object is built. Same as
    // the existing `spacing` / `border-radius` groups, and equally harmless —
    // consumers read this by key. The CSS emit re-sorts, where order is visible.
    dimension: Object.fromEntries(
      Object.entries(dimensionTokens).map(([step, value]) => [
        step,
        { $type: "dimension", $value: value } satisfies DtcgToken,
      ]),
    ),
  };
}

export function buildThemeJson(state: BuilderState): string {
  return JSON.stringify(buildThemeTokens(state), null, 2) + "\n";
}

// ─── icons.ts (IconProvider snippet) ────────────────────────────────────────────

export function buildIconsModule(state: BuilderState): string {
  const { library, style, strokeAdjustment, baseSize, baseStroke } = state.icons;
  const pkg = ICON_PACKAGES[library];
  // No `import { IconProvider }` here. This module only exports data, so the
  // import went unused — and `noUnusedLocals` (on by default in the Vite React
  // template) turns that into a build error the moment the file is dropped in.
  return `/**
 * Icon configuration exported from the UI Organized Theme Builder.
 *
 * Icons are runtime React context, not CSS — wrap your app with <IconProvider>
 * so every <Icon> inherits the chosen library, style, reference size and stroke
 * scaling. Requires the matching icon package: \`npm i ${pkg}\`.
 *
 * Mount once near the root of your app:
 *
 *   import { IconProvider } from "@ui-organized/react";
 *   import { iconConfig } from "./icons";
 *
 *   <IconProvider {...iconConfig}>
 *     <App />
 *   </IconProvider>
 *
 * Note the \`as const\`: \`library\`, \`style\` and \`strokeAdjustment\` are literal
 * types, not \`string\`/\`boolean\`. Spreading is fine, but seeding React state from
 * one needs the type written out — \`useState<boolean>(iconConfig.strokeAdjustment)\`,
 * otherwise it infers \`useState<${strokeAdjustment}>\` and won't accept the other value.
 */
export const iconConfig = {
  library: ${JSON.stringify(library)},
  style: ${JSON.stringify(style)},
  strokeAdjustment: ${strokeAdjustment},
  baseSize: ${baseSize},
  baseStroke: ${baseStroke},
} as const;
`;
}

// ─── README ──────────────────────────────────────────────────────────────────────

export function buildReadme(state: BuilderState): string {
  const name = state.themeName || "My Theme";
  const pkg = ICON_PACKAGES[state.icons.library];
  const fonts = resolveThemeFonts(state);
  const familyList = fonts.map((f) => `**${f.family}**`).join(" and ");

  // Weights the chosen families don't ship. Google answers 200 and omits the
  // face, so the browser synthesises it — which is worth saying out loud in the
  // README rather than leaving someone to wonder why their bold looks smeared.
  const synthesised = [
    { role: "heading", family: state.headingFamily, missing: unservableWeights(Object.values(state.headingWeights), state.headingFontAvailable) },
    { role: "body", family: state.bodyFamily, missing: unservableWeights(Object.values(state.bodyWeights), state.bodyFontAvailable) },
  ].filter((f) => f.missing.length > 0);

  const mode = state.exportDefaultMode;
  const rootMode = mode === "system" ? "light" : mode;
  const defaultLine =
    mode === "system"
      ? "`:root` is light and follows `prefers-color-scheme` when no `data-theme` is set."
      : `\`:root\` is **${mode}** — that is what a page renders as before any \`data-theme\` is set.`;

  return `# ${name}

Exported from the UI Organized Theme Builder. This bundle is one source of truth
in three consumable shapes.

## Files

- **theme.json** — DTCG design tokens (the canonical config). \`primitive.color\`
  holds the full ramps of every color family this theme uses; \`color.light\` /
  \`color.dark\` are the semantic tokens, each **referencing** a primitive
  (\`{primitive.color.…}\`) or carrying a raw literal. Typography, spacing, radius,
  dimension and component aliases are theme-independent. Icon settings live under
  \`$extensions["com.ui-organized.theme-builder"].icons\`.
- **theme.css** — derived web stylesheet (CSS custom properties for both modes).
  Use this if you just want to drop the theme into a web app.
- **icons.ts** — \`IconProvider\` config. Icons are React context, not a CSS or
  Figma variable, so they are applied in code rather than through the tokens.
- **fonts.ts** — the typefaces this theme names, with the stylesheet URL that
  loads each one. \`theme.css\` can name a font but cannot efficiently fetch it,
  so loading is left to your document head.

## Use in code (web)

Install the library, then import the stylesheets **in this order** at your app
entry:

\`\`\`ts
// src/main.tsx
import '@ui-organized/react/styles'   // 1. component styles
import './styles/theme.css'           // 2. this export — after, so it wins
import './index.css'                  // 3. your own layout, last
\`\`\`

Order is load-bearing. \`theme.css\` and any baseline token stylesheet both
declare on \`:root\`, and \`:root\` vs \`:root\` is a specificity tie — decided by
source order. Import the theme earlier and the baseline silently wins.

This file is self-contained: it carries the resolved colors *and* the
theme-independent constants (\`--dimension-*\`, \`--z-index-*\`) the component
styles need, so \`@ui-organized/tokens/variables.css\` is optional. Add it *before*
\`theme.css\` if you also want the raw primitive ramps to reference directly.

### Modes

${defaultLine} Switch by attribute — no re-import:

\`\`\`ts
document.documentElement.setAttribute('data-theme', 'light')  // or 'dark'
\`\`\`

Pin the default in your HTML so the first frame paints correctly, before any
JavaScript runs:

\`\`\`html
<html lang="en" data-theme="${rootMode}">
\`\`\`

Setting \`data-theme\` is a DOM mutation, so nothing re-renders on its own. Code
that reads resolved token values needs a \`MutationObserver\` on the attribute.

## Use the fonts (web)

This theme is set in ${familyList}. **\`theme.css\` names those families but does
not load them** — add these to your document \`<head>\`:

\`\`\`html
${fontLinkTags(fonts)}
\`\`\`

Without them the theme's metrics — sizes, weights and leading — render in
whatever fallback the browser picks. It looks deliberate, which is exactly why
it's easy to miss.

The tags are deliberately *not* an \`@import\` inside \`theme.css\`. An \`@import\` is
invisible to the browser's preload scanner, so the font would sit behind a second
round trip, and it would hard-code a CDN into your tokens — which makes
self-hosting a matter of editing generated output after every re-export.
\`fonts.ts\` carries the same list as data if you'd rather generate the tags at
build time, or self-host the files and ignore these entirely.
${
  synthesised.length > 0
    ? `
> **Note:** ${synthesised
        .map(
          (f) =>
            `${f.family} does not ship weight${f.missing.length > 1 ? "s" : ""} ${listPhrase(f.missing.map(String))}`,
        )
        .join("; ")}. The browser will synthesise ${synthesised.length > 1 ? "those" : "that"} rather than load a real face, which usually reads heavier and looser than the genuine cut.
`
    : ""
}
> **Watch the cascade:** any \`--type-font-*\` declaration in a stylesheet imported
> *after* \`theme.css\` silently overrides these families. Loading the font does not
> fix that — check your import order first if the typeface still looks wrong.

## Use the icons (code)

The icon libraries are *optional* peer dependencies — picking one in the builder
that you have not installed fails at import time, not at export time:

\`\`\`sh
npm i ${pkg}
\`\`\`

Then wrap your app with the exported config (see \`icons.ts\`):

\`\`\`tsx
import { IconProvider } from '@ui-organized/react'
import { iconConfig } from './icons'

<IconProvider {...iconConfig}>
  <App />
</IconProvider>
\`\`\`

## Use in Figma

Import **theme.json** with the **UI Organized - Theme Import** plugin. It creates
(or updates) four variable collections:

- **Primitives** — the used global colors from \`primitive.color\`.
- **Semantic** — \`color.light\` / \`color.dark\` as the collection's Light/Dark
  modes; each color is a Figma **alias** pointing at a Primitive, so re-skinning
  the brand/neutral re-flows everything.
- **Scale** — spacing, radius, fixed dimensions and component dimensions,
  including the shared \`control-height\` (sm/md/lg) that keeps buttons, inputs and
  selects aligned.
- **Typography** — font families, weights, sizes and line-heights.
- **Icons** — only when dynamic stroke scaling is on: each icon size with its
  optically-corrected stroke weight (Figma can't compute strokes the way the
  \`<Icon>\` component does at runtime, so the plugin materialises them).

Re-running the import overwrites existing variables in place and adds new ones.
Icon library/style settings are otherwise metadata — apply them in code via
\`icons.ts\`.
`;
}
