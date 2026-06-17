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
  type CSSVarMap,
} from "./semanticMapping";
import { resolveSemanticColors } from "@ui-organized/utils";
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

// ─── Color: flat `--color-*` map → nested DTCG group ────────────────────────────

/**
 * Turn a resolved `{ "--color-surface-base": "#hex" }` map into a nested group
 * keyed by category, e.g. `surface.base`. The bare `--brand` token maps to
 * `brand`. Mirrors the semantic taxonomy of the shipped color tokens.
 */
function colorTokensFromMap(map: CSSVarMap): DtcgGroup {
  const group: DtcgGroup = {};
  for (const [cssVar, value] of Object.entries(map)) {
    const name = cssVar.replace(/^--/, "");
    const token: DtcgToken = { $type: "color", $value: value };

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

// ─── Typography ─────────────────────────────────────────────────────────────────

function typographyTokens(state: BuilderState): DtcgGroup {
  // Reuse the exact same computation the CSS export uses, so JSON ↔ CSS agree.
  const vars = computeTypographyVars(
    state.headingFamily,
    state.bodyFamily,
    state.headingWeights,
    state.bodyWeights,
    state.typeScaleSteps,
    state.headingLineHeight,
    state.bodyLineHeight,
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
      "heading-regular": weightToken(state.headingWeights.default ?? 400),
      "heading-medium": weightToken(state.headingWeights.emphasis ?? 500),
      "heading-semibold": weightToken(state.headingWeights.strong ?? 600),
      "heading-bold": weightToken(state.headingWeights.heavy ?? 700),
      "body-regular": weightToken(state.bodyWeights.default ?? 400),
      "body-medium": weightToken(state.bodyWeights.emphasis ?? 500),
      "body-semibold": weightToken(state.bodyWeights.strong ?? 600),
      "body-bold": weightToken(state.bodyWeights.heavy ?? 700),
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

/** Component-level aliases (`--radius-*`, `--Button-*`) → `radius.*` / `button.*`. */
function componentTokens(state: BuilderState): DtcgGroup {
  const vars = computeComponentTokenVars(state.borderRadius, state.spacingScale);
  const radius: DtcgGroup = {};
  const button: DtcgGroup = {};
  for (const [cssVar, value] of Object.entries(vars)) {
    const name = cssVar.replace(/^--/, "");
    const token: DtcgToken = { $type: "dimension", $value: value };
    if (name.startsWith("radius-")) {
      radius[name.slice("radius-".length)] = token;
    } else if (name.startsWith("Button-")) {
      button[name.slice("Button-".length).toLowerCase()] = token;
    }
  }
  return { radius, button };
}

// ─── Theme JSON (DTCG document) ─────────────────────────────────────────────────

export function buildThemeTokens(state: BuilderState): Record<string, unknown> {
  const colorOpts = {
    brandRamp: state.brandRamp,
    neutralRamp: state.neutralRamp,
    brandShade: state.brandShade,
  };

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
        typeScale: { base: state.typeScaleBase, ratio: state.typeScaleRatio },
        // Icons are runtime React config (IconProvider), not a CSS/Figma variable
        // type — captured here and emitted as icons.ts for code consumers.
        icons: { ...state.icons, package: ICON_PACKAGES[state.icons.library] },
      },
    },
    color: {
      // Two modes — map these to a "Color" variable collection's light/dark modes.
      light: colorTokensFromMap(resolveSemanticColors("light", colorOpts)),
      dark: colorTokensFromMap(resolveSemanticColors("dark", colorOpts)),
    },
    type: typographyTokens(state),
    spacing: dimensionTokensFromMap(computeSpacingVars(state.spacingScale), "spacing-"),
    "border-radius": dimensionTokensFromMap(computeRadiusVars(state.borderRadius), "border-radius-"),
    component: componentTokens(state),
  };
}

export function buildThemeJson(state: BuilderState): string {
  return JSON.stringify(buildThemeTokens(state), null, 2) + "\n";
}

// ─── icons.ts (IconProvider snippet) ────────────────────────────────────────────

export function buildIconsModule(state: BuilderState): string {
  const { library, style, strokeAdjustment, baseSize, baseStroke } = state.icons;
  const pkg = ICON_PACKAGES[library];
  return `/**
 * Icon configuration exported from the Design System Theme Builder.
 *
 * Icons are runtime React context, not CSS — wrap your app with <IconProvider>
 * so every <Icon> inherits the chosen library, style, reference size and stroke
 * scaling. Requires the matching icon package: \`npm i ${pkg}\`.
 */
import { IconProvider } from "@ui-organized/react";

export const iconConfig = {
  library: ${JSON.stringify(library)},
  style: ${JSON.stringify(style)},
  strokeAdjustment: ${strokeAdjustment},
  baseSize: ${baseSize},
  baseStroke: ${baseStroke},
} as const;

// Usage — mount once near the root of your app:
//
//   import { iconConfig } from "./icons";
//
//   <IconProvider {...iconConfig}>
//     <App />
//   </IconProvider>
`;
}

// ─── README ──────────────────────────────────────────────────────────────────────

export function buildReadme(state: BuilderState, cssFileName: string): string {
  const name = state.themeName || "My Theme";
  const pkg = ICON_PACKAGES[state.icons.library];
  return `# ${name}

Exported from the Design System Theme Builder. This bundle is one source of
truth in three consumable shapes.

## Files

- **theme.json** — DTCG design tokens (the canonical config). Colors are split
  into \`color.light\` and \`color.dark\`; typography, spacing, radius and component
  aliases are theme-independent. Icon settings live under
  \`$extensions["com.ui-organized.theme-builder"].icons\`.
- **${cssFileName}** — derived web stylesheet (CSS custom properties for both
  modes). Use this if you just want to drop the theme into a web app.
- **icons.ts** — \`IconProvider\` config. Icons are React context, not a CSS or
  Figma variable, so they are applied in code rather than through the tokens.

## Use in code (web)

\`\`\`ts
import '@ui-organized/react/styles.css'
import './styles/${cssFileName}'
\`\`\`

The theme defaults to dark on \`:root\`. Toggle modes with \`data-theme="light"\`
or \`data-theme="dark"\` on \`<html>\`.

## Use the icons (code)

\`\`\`sh
npm i ${pkg}
\`\`\`

Then wrap your app with the exported config (see \`icons.ts\`):

\`\`\`tsx
import { iconConfig } from './icons'
import { IconProvider } from '@ui-organized/react'

<IconProvider {...iconConfig}>
  <App />
</IconProvider>
\`\`\`

## Use in Figma

Import **theme.json** with the Tokens Studio for Figma plugin (or the Figma
Variables REST API). Map \`color.light\` / \`color.dark\` to the two modes of a
color variable collection. Icon settings are metadata only — Figma has no icon
variable type — so apply them in code via \`icons.ts\`.
`;
}
