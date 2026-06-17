# Style Dictionary Pipeline — Setup Instructions

> This document covers how to transform your Figma-exported tokens into CSS custom properties via Style Dictionary v4. It is a companion to `design-system-build-instructions.md` and covers the technical details of `packages/tokens`.

---

## Fix These Typos in Figma First

Before re-exporting, fix these variable names in your Figma file:

| Location | Current (wrong) | Correct |
|---|---|---|
| Primitive collection | `waterloo ` (trailing space) | `waterloo` |
| Semantic > dimension | `dimesnion-01` through `dimesnion-12` | `dimension-01` through `dimension-12` |
| Semantic > color-icon | `icon-seconadry` | `icon-secondary` |

Fix these in Figma, re-export, then proceed. Typos in variable names become typos in CSS custom property names, which become typos in every component CSS file. Fix once at the source.

---

## Your Current Export Structure

Your Figma plugin exports two JSON files with the following structure:

### `primitive-tokens.json`

```
Array wrapper (remove)
└── Primitive
    └── modes
        └── Light
            ├── curtain (overlay colors with alpha)
            ├── white (16 steps: 100–1600)
            ├── black (16 steps: 100–1600)
            ├── dove, mythical, flint, waterloo, stone, cave,
            │   juniper, battleship, squirrel, hemp (neutral presets, 16 steps each)
            ├── passion, cerise, violet, eggplant, purple, lapis,
            │   persian, cerulean, aqua, damselfly, scooter, caribbean,
            │   emerald, malachite, lima, inch worm, lime, candlelight,
            │   midas, lightning, dough, meteor, mars, pumpkin,
            │   cinnabar, crimson (functional/extended palette, 16 steps each)
            ├── mavic, shark (neutral ramps used by semantic tokens)
            └── brand (16 steps: 100–1600)
```

### `ui-tokens.json`

Contains collections in an array. After your Figma restructure, the collections will be:

**Collection — Component tokens** (has Desktop/Mobile modes)
```
Component
└── modes
    ├── Desktop
    │   ├── radius-interactive → references {border-radius.04}
    │   ├── radius-checkbox → references {border-radius.02}
    │   ├── radius-status → references {border-radius.full}
    │   └── Button (Small/Medium/Large with horizontal/vertical/square spacing)
    └── Mobile (same structure, different spacing values)
```

**Collection — Semantic tokens** (single "Value" mode)
```
Semantic
└── modes
    └── Value
        ├── color-border (subtle, medium, emphasis, strong, data-entry → primitive refs)
        ├── color-interactive
        │   ├── primary (default/hover/active/selected → brand refs)
        │   ├── secondary (default/hover/active/selected → neutral refs)
        │   ├── tertiary (default/hover/active/selected → brand refs)
        │   ├── ghost (default/hover/active → black refs)
        │   ├── destructive (default/hover/active + ghost variants → crimson refs)
        │   ├── contents → white.100
        │   ├── ui (default/hover/active/selected → neutral refs)
        │   ├── focus / focus-inverse
        │   └── inactive (inactive-01/02/03 → black refs)
        ├── color-icon (icon-primary/secondary/tertiary → white refs)
        ├── color-status (success/info/caution/warning/error with -bg/-content variants)
        ├── color-surface (base/subtle/medium/emphasis/strong/overlay — solid values)
        ├── color-text (primary/secondary/interactive/tertiary/placeholder/inverse)
        ├── color-elevation (subtle/medium — mode-dependent composite values for layering)
        ├── dimension (dimension-01 through dimension-12, raw px values)
        └── brand → references {brand.900}
```

**Collection — Border Radius** (own collection, separate from Semantic)
```
Border Radius
└── modes
    └── Value
        └── radius-01 through radius-12 + radius-full (raw px values)
```

**Collection — Spacing** (own collection, separate from Semantic)
```
Spacing
└── modes
    └── Value
        └── space-005 through space-32 (raw px values)
```

**Collection — Typography** (has Desktop/Mobile modes)
```
Typography
└── modes
    ├── Desktop
    │   ├── Font Size (display-xlarge through caption, raw px values)
    │   └── Font Families (Font, Default, Emphasis, Strong, Heavy)
    └── Mobile (same structure, same values currently)
```

---

## What Style Dictionary Needs

Style Dictionary v4 expects DTCG-formatted JSON files. Each token needs:
- `$value` — the token's value (you already have this)
- `$type` — a valid DTCG type (yours need mapping)

Style Dictionary does NOT understand:
- Array wrappers
- The `modes` nesting layer
- Figma-specific fields (`$scopes`, `$libraryName`, `$collectionName`)
- The `$type: "float"` — DTCG uses `"dimension"`, `"number"`, `"color"`, or `"string"`

---

## Token File Architecture in packages/tokens

After transformation, your `packages/tokens` directory should contain clean DTCG files organized by layer:

```
packages/tokens/
├── src/
│   ├── primitive/
│   │   └── colors.json              # All primitive color ramps (mode-independent values)
│   ├── semantic/
│   │   ├── color-border.json         # Border color aliases → primitive refs
│   │   ├── color-interactive.json    # Interactive state colors → primitive refs
│   │   ├── color-icon.json           # Icon colors → primitive refs
│   │   ├── color-status.json         # Status colors → primitive refs
│   │   ├── color-surface.json        # Surface/background colors → primitive refs (solid values)
│   │   ├── color-text.json           # Text colors → primitive refs
│   │   ├── color-elevation.json       # Elevation layering tokens (subtle, medium — mode-dependent composites)
│   │   ├── dimension.json            # Dimension scale (raw values)
│   │   └── brand.json                # Brand alias → primitive ref
│   ├── border-radius/
│   │   └── border-radius.json        # Radius scale (raw values, own Figma collection)
│   ├── spacing/
│   │   └── spacing.json              # Spacing scale (raw values, own Figma collection)
│   ├── component/
│   │   ├── button.desktop.json       # Button spacing for desktop
│   │   ├── button.mobile.json        # Button spacing for mobile
│   │   └── radius.json               # Component-level radius aliases
│   ├── typography/
│   │   ├── font-size.desktop.json    # Type scale for desktop
│   │   ├── font-size.mobile.json     # Type scale for mobile
│   │   └── font-families.json        # Font family + weight roles
│   └── curtain/
│       └── overlay.json              # Overlay/curtain opacity colors (rgba)
├── transform.ts                      # Script that converts raw Figma export → DTCG files above
├── config.ts                         # Style Dictionary configuration
├── build.ts                          # Build script entry point
└── output/
    └── variables.css                 # Generated CSS custom properties (build output)
```

---

## The Transform Script (transform.ts)

This script reads your raw Figma exports and writes clean DTCG files. It performs these operations:

### 1. Strip wrappers and Figma-specific fields

Remove the outer array. Unwrap the `modes` nesting. For each token, keep only `$value` and `$type`. Strip `$scopes`, `$libraryName`, `$collectionName`.

### 2. Map $type values to DTCG types

| Figma export `$type` | DTCG `$type` | Applied to |
|---|---|---|
| `"color"` | `"color"` | All color tokens (no change needed) |
| `"float"` with scope `CORNER_RADIUS` | `"dimension"` | Border radius values |
| `"float"` with scope `GAP` | `"dimension"` | Spacing values |
| `"float"` with scope `WIDTH_HEIGHT` | `"dimension"` | Dimension values |
| `"float"` (font sizes) | `"dimension"` | Typography size values |
| `"string"` | `"string"` | Font family and weight names |

For raw numeric values (spacing, radius, dimension), append `px` to the `$value` so it becomes a valid DTCG dimension. For example, `"$value": 8` becomes `"$value": "8px"`.

### 3. Qualify alias references

Your semantic tokens reference primitives with short paths like `{brand.900}`. These need to be expanded to full paths that Style Dictionary can resolve across files.

The rule: prepend the collection name to the path.

| Current reference | Qualified reference |
|---|---|
| `{brand.900}` | `{primitive.brand.900}` |
| `{shark.1100}` | `{primitive.shark.1100}` |
| `{white.100}` | `{primitive.white.100}` |
| `{black.800}` | `{primitive.black.800}` |
| `{crimson.1000}` | `{primitive.crimson.1000}` |
| `{lima.1300}` | `{primitive.lima.1300}` |
| `{cerulean.1300}` | `{primitive.cerulean.1300}` |
| (all other primitive color refs) | `{primitive.[name].[step]}` |
| `{border-radius.04}` | `{border-radius.04}` (own collection, no prefix change needed) |
| `{spacing.space-02}` | `{spacing.space-02}` (own collection, no prefix change needed) |

The transform script should detect references by the `{...}` pattern and prepend the correct collection prefix based on where the referenced token lives.

### 4. Handle spaces and special characters in key names

Some of your Figma variable names contain spaces (`Font Size`, `Font Families`, `inch worm`). These need to be converted to kebab-case for use as CSS custom property names:

| Figma name | Cleaned name |
|---|---|
| `Font Size` | `font-size` |
| `Font Families` | `font-families` |
| `inch worm` | `inch-worm` |

### 5. Output clean DTCG files

Write each token group as a separate JSON file in the correct directory. Example output for `semantic/color-border.json`:

```json
{
  "semantic": {
    "color-border": {
      "subtle": {
        "$type": "color",
        "$value": "{primitive.black.1100}"
      },
      "medium": {
        "$type": "color",
        "$value": "{primitive.black.1000}"
      },
      "emphasis": {
        "$type": "color",
        "$value": "{primitive.black.900}"
      },
      "strong": {
        "$type": "color",
        "$value": "{primitive.black.800}"
      },
      "data-entry": {
        "$type": "color",
        "$value": "{primitive.black.700}"
      }
    }
  }
}
```

Example output for `semantic/spacing.json`:

```json
{
  "semantic": {
    "spacing": {
      "space-005": {
        "$type": "dimension",
        "$value": "2px"
      },
      "space-01": {
        "$type": "dimension",
        "$value": "4px"
      },
      "space-015": {
        "$type": "dimension",
        "$value": "6px"
      },
      "space-02": {
        "$type": "dimension",
        "$value": "8px"
      }
    }
  }
}
```

Example output for `primitive/colors.json` (abbreviated):

```json
{
  "primitive": {
    "brand": {
      "100": { "$type": "color", "$value": "#e2f2ff" },
      "200": { "$type": "color", "$value": "#c5e5ff" },
      "900": { "$type": "color", "$value": "#008ffb" },
      "1600": { "$type": "color", "$value": "#001a33" }
    },
    "shark": {
      "100": { "$type": "color", "$value": "#919baf" },
      "200": { "$type": "color", "$value": "#808ca3" }
    }
  }
}
```

---

## Style Dictionary Configuration (config.ts)

Style Dictionary v4 uses a TypeScript-based configuration. Here is what your config needs to do:

### Source files

Point Style Dictionary at all the DTCG files in your `src/` directory:

```
source: ['src/**/*.json']
```

### Platform: CSS

Define a single CSS platform that outputs custom properties:

- **transformGroup:** Use `css` (the built-in CSS transform group)
- **buildPath:** `output/`
- **Output files:** Generate one or more CSS files with custom properties

### Custom property naming

Style Dictionary will generate CSS custom property names from the token path. The default behavior converts the nested JSON path to a kebab-case name with `--` prefix:

```
primitive.brand.900     →  --primitive-brand-900
semantic.color-border.subtle  →  --semantic-color-border-subtle
semantic.spacing.space-02     →  --semantic-spacing-space-02
component.button.small.horizontal  →  --component-button-small-horizontal
typography.font-size.body-large    →  --typography-font-size-body-large
```

You may want to customize the naming to drop the collection prefix for cleaner names. For example, if you want components to reference `var(--color-border-subtle)` instead of `var(--semantic-color-border-subtle)`, add a custom name transform that strips the `semantic` prefix from semantic tokens, the `primitive` prefix from primitives, and the `component` prefix from component tokens. However, keeping the full path is safer initially — it prevents name collisions and makes the token's origin clear. You can simplify names later once the system is stable.

### Mode handling

For your current export (single Light mode for primitives, single Value mode for semantics), all tokens go into a single `:root` block. No mode-specific scoping is needed yet.

When you add dark mode later, you will:
1. Export a second set of semantic color tokens with dark mode values
2. Generate a second CSS block scoped to `[data-mode="dark"]` that overrides only the semantic color properties
3. Primitive values stay the same — only semantic mappings change

When you add Desktop/Mobile responsive modes, you will:
1. Generate the desktop component/typography tokens in the default `:root` block
2. Generate mobile overrides in a `@media` block or scoped to a `[data-density="mobile"]` attribute

For now, use the Desktop values as defaults and skip Mobile. The architecture supports adding it later without restructuring.

### Alias resolution

Style Dictionary automatically resolves alias references (`{primitive.brand.900}` → the actual hex value). In the generated CSS, referenced tokens output the resolved value, not a `var()` reference. This means:

```css
/* primitive token */
--primitive-brand-900: #008ffb;

/* semantic token — resolved from {primitive.brand.900} */
--semantic-color-interactive-primary-default: #005aa5;
```

If you want semantic tokens to output as `var()` references instead (so changing a primitive cascades at runtime), you need to configure Style Dictionary's `outputReferences` option to `true`. This produces:

```css
--primitive-brand-1200: #005aa5;
--semantic-color-interactive-primary-default: var(--primitive-brand-1200);
```

**Recommendation: Use `outputReferences: true` for semantic and component tokens.** This is what makes theming work at runtime — when the primitive value changes (via mode switch or theme swap), all semantic tokens that reference it update automatically through CSS variable cascading.

---

## CSS Output Structure

With `outputReferences: true`, your generated `variables.css` should look like this:

```css
/* ============================================
   PRIMITIVE TOKENS — raw values
   ============================================ */

:root {
  /* Brand */
  --primitive-brand-100: #e2f2ff;
  --primitive-brand-200: #c5e5ff;
  /* ... through 1600 */
  --primitive-brand-900: #008ffb;

  /* Shark (neutral) */
  --primitive-shark-100: #919baf;
  /* ... */

  /* White */
  --primitive-white-100: #fcfcfc;
  /* ... */

  /* Black */
  --primitive-black-100: #747474;
  /* ... */

  /* All other primitive ramps: mavic, flint, stone, cave, dove, 
     mythical, waterloo, juniper, battleship, squirrel, hemp,
     crimson, lima, cerulean, candlelight, cerise, caribbean, etc. */
}

/* ============================================
   SEMANTIC TOKENS — aliases referencing primitives
   ============================================ */

:root {
  /* Border colors */
  --semantic-color-border-subtle: var(--primitive-black-1100);
  --semantic-color-border-medium: var(--primitive-black-1000);
  --semantic-color-border-emphasis: var(--primitive-black-900);
  --semantic-color-border-strong: var(--primitive-black-800);
  --semantic-color-border-data-entry: var(--primitive-black-700);

  /* Interactive colors */
  --semantic-color-interactive-primary-default: var(--primitive-brand-1200);
  --semantic-color-interactive-primary-hover: var(--primitive-brand-1400);
  --semantic-color-interactive-primary-active: var(--primitive-brand-1600);
  --semantic-color-interactive-primary-selected: var(--primitive-brand-1200);
  /* ... secondary, tertiary, ghost, destructive, ui, focus, inactive */

  /* Text colors */
  --semantic-color-text-primary: var(--primitive-white-100);
  --semantic-color-text-secondary: var(--primitive-white-800);
  /* ... */

  /* Surface colors */
  --semantic-color-surface-base: var(--primitive-shark-1600);
  --semantic-color-surface-subtle: var(--primitive-shark-1500);
  /* ... */

  /* Status colors */
  --semantic-color-status-success: var(--primitive-lima-1300);
  --semantic-color-status-success-bg: var(--primitive-lima-1600);
  --semantic-color-status-success-content: var(--primitive-lima-300);
  /* ... info, caution, warning, error */

  /* Icon colors */
  --semantic-color-icon-primary: var(--primitive-white-100);
  --semantic-color-icon-secondary: var(--primitive-white-800);
  --semantic-color-icon-tertiary: var(--primitive-white-1100);

  /* Elevation layering tokens — mode-dependent composite values */
  /* Dark mode (default): neutral 400 step at 8% and 16% opacity */
  --semantic-color-elevation-subtle: oklch(from var(--primitive-neutral-400) l c h / 0.08);
  --semantic-color-elevation-medium: oklch(from var(--primitive-neutral-400) l c h / 0.16);

  /* Note: In light mode, these override to use neutral 1400 step:
     --semantic-color-elevation-subtle: oklch(from var(--primitive-neutral-1400) l c h / 0.08);
     --semantic-color-elevation-medium: oklch(from var(--primitive-neutral-1400) l c h / 0.16);
  */

  /* Dimensions */
  --semantic-dimension-01: 40px;
  --semantic-dimension-02: 80px;
  /* ... through dimension-12 */

  /* Brand alias */
  --semantic-brand: var(--primitive-brand-900);
}

/* ============================================
   BORDER RADIUS TOKENS — own collection
   ============================================ */

:root {
  --border-radius-01: 2px;
  --border-radius-02: 4px;
  /* ... through radius-12 */
  --border-radius-full: 99999px;
}

/* ============================================
   SPACING TOKENS — own collection
   ============================================ */

:root {
  --spacing-space-005: 2px;
  --spacing-space-01: 4px;
  --spacing-space-015: 6px;
  --spacing-space-02: 8px;
  /* ... through space-32 */
}

/* ============================================
   COMPONENT TOKENS — aliases referencing semantics
   ============================================ */

:root {
  /* Component radius */
  --component-radius-interactive: var(--border-radius-04);
  --component-radius-checkbox: var(--border-radius-02);
  --component-radius-status: var(--border-radius-full);

  /* Button - Desktop (default) */
  --component-button-small-horizontal: var(--spacing-space-02);
  --component-button-small-vertical: var(--spacing-space-005);
  --component-button-medium-horizontal: var(--spacing-space-03);
  --component-button-medium-vertical: var(--spacing-space-01);
  --component-button-large-horizontal: var(--spacing-space-04);
  --component-button-large-vertical: var(--spacing-space-02);
  --component-button-large-square: var(--spacing-space-025);
}

/* ============================================
   TYPOGRAPHY TOKENS
   ============================================ */

:root {
  /* Font family + weight roles */
  --typography-font-families-font: 'Roboto';
  --typography-font-families-default: 'Regular';
  --typography-font-families-emphasis: 'Medium';
  --typography-font-families-strong: 'Semi Bold';
  --typography-font-families-heavy: 'Bold';

  /* Font sizes - Desktop (default) */
  --typography-font-size-display-xlarge: 64px;
  --typography-font-size-display-large: 48px;
  --typography-font-size-display-medium: 40px;
  --typography-font-size-heading-large: 32px;
  --typography-font-size-heading-medium: 24px;
  --typography-font-size-heading-small: 20px;
  --typography-font-size-body-large: 16px;
  --typography-font-size-body-medium: 14px;
  --typography-font-size-body-small: 12px;
  --typography-font-size-caption: 10px;
}

/* ============================================
   OVERLAY / CURTAIN TOKENS
   ============================================ */

:root {
  --primitive-curtain-black-80p: rgba(0, 0, 0, 0.8);
  --primitive-curtain-black-1200-80p: rgba(32, 32, 32, 0.8);
}
```

---

## How Components Reference These Tokens

Your component CSS files reference the semantic and component-level tokens. Components should NEVER reference primitive tokens directly — always go through the semantic layer so theming and mode switching work.

Example `Button.css`:

```css
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--component-radius-interactive);
  font-family: var(--typography-font-families-font);
  font-weight: var(--typography-font-families-default);
  cursor: pointer;
}

/* Intent variants */
.btn--primary {
  background-color: var(--semantic-color-interactive-primary-default);
  color: var(--semantic-color-interactive-contents);
}
.btn--primary:hover {
  background-color: var(--semantic-color-interactive-primary-hover);
}
.btn--primary:active {
  background-color: var(--semantic-color-interactive-primary-active);
}

.btn--secondary {
  background-color: var(--semantic-color-interactive-secondary-default);
  color: var(--semantic-color-text-primary);
}

.btn--ghost {
  background-color: var(--semantic-color-interactive-ghost-default);
  color: var(--semantic-color-text-primary);
}

.btn--destructive {
  background-color: var(--semantic-color-interactive-destructive-default);
  color: var(--semantic-color-interactive-contents);
}

/* Size variants */
.btn--sm {
  padding: var(--component-button-small-vertical) var(--component-button-small-horizontal);
  font-size: var(--typography-font-size-body-small);
}
.btn--md {
  padding: var(--component-button-medium-vertical) var(--component-button-medium-horizontal);
  font-size: var(--typography-font-size-body-medium);
}
.btn--lg {
  padding: var(--component-button-large-vertical) var(--component-button-large-horizontal);
  font-size: var(--typography-font-size-body-large);
}

/* States */
.btn:disabled {
  background-color: var(--semantic-color-interactive-inactive-01);
  color: var(--semantic-color-interactive-inactive-03);
  cursor: not-allowed;
}
.btn:focus-visible {
  outline: 2px solid var(--semantic-color-interactive-focus);
  outline-offset: 2px;
}
```

---

## Wiring It Into Your App

### Step 1: Import the generated CSS

In your app's entry point (e.g., `main.tsx` or `App.tsx`):

```tsx
import '@your-scope/tokens/output/variables.css'
import '@your-scope/react/styles.css'  // component styles
```

The token CSS must load BEFORE the component CSS so all `var()` references resolve.

### Step 2: Verify in browser dev tools

Open your app, inspect any element, and check the `:root` styles. You should see all your custom properties listed. If a component shows the wrong color or no color, check that the `var()` name in the component CSS exactly matches the property name in the generated CSS.

---

## Build Pipeline Integration

Add the token build as a Turborepo task that runs before the component library builds:

```
packages/tokens build → packages/react build → apps/storybook build
```

The `tokens` package's build script:
1. Runs `transform.ts` to convert raw Figma exports into clean DTCG files (skip this step once your Figma plugin exports DTCG directly)
2. Runs Style Dictionary to generate `output/variables.css`

The `react` package's build:
1. Imports the generated CSS from `packages/tokens`
2. Bundles it with the component CSS files into a single distributable stylesheet

---

## Adding Modes Later

### Light mode (color modes)

Your current Figma tokens default to dark mode (surfaces are dark, text is light). When adding light mode:

1. Set up your Figma variables with a Light mode on the semantic color collection
2. Export the light mode semantic values (same token names, different primitive references)
3. Add a mode-specific override file
4. Configure Style Dictionary to output light mode values scoped to `[data-mode="light"]`:

```css
[data-mode="light"] {
  --semantic-color-surface-base: var(--primitive-neutral-100);
  --semantic-color-text-primary: var(--primitive-black-1600);
  /* ... all semantic color overrides */

  /* Elevation tokens shift to the 1400 step in light mode */
  --semantic-color-elevation-subtle: oklch(from var(--primitive-neutral-1400) l c h / 0.08);
  --semantic-color-elevation-medium: oklch(from var(--primitive-neutral-1400) l c h / 0.16);
}
```

Primitive tokens don't change. Only semantic color mappings and overlay composite values shift. Components reference semantics, so they update automatically.

### Mobile mode (responsive/density modes)

1. Export mobile-specific component and typography values
2. Output as a media query or data attribute scope:

```css
@media (max-width: 768px) {
  --component-button-small-horizontal: var(--semantic-spacing-space-03);
  --component-button-small-vertical: var(--semantic-spacing-space-02);
  /* ... mobile overrides */
}
```

Or use a data attribute for manual control:

```css
[data-density="mobile"] {
  --component-button-small-horizontal: var(--semantic-spacing-space-03);
  /* ... */
}
```

### Multiple fonts (heading + body)

When you add dual font support:

1. Split `--typography-font-families-font` into `--typography-font-heading` and `--typography-font-body`
2. Components that render headings reference `--typography-font-heading`
3. Components that render body text reference `--typography-font-body`
4. Both are user-configurable in the theme config

---

## Naming Simplification (Optional, Do Later)

The full paths (`--semantic-color-border-subtle`) are verbose. Once your token architecture is stable and you're confident in the naming, you can add a custom name transform in Style Dictionary to produce shorter names:

| Full path | Simplified |
|---|---|
| `--semantic-color-border-subtle` | `--color-border-subtle` |
| `--semantic-color-interactive-primary-default` | `--color-interactive-primary-default` |
| `--semantic-color-elevation-subtle` | `--color-elevation-subtle` |
| `--spacing-space-02` | `--space-02` |
| `--border-radius-04` | `--radius-04` |
| `--component-button-small-horizontal` | `--button-small-horizontal` |
| `--typography-font-size-body-large` | `--font-size-body-large` |
| `--primitive-brand-900` | `--brand-900` |

Do this AFTER components are built and tested with the full names. Renaming is a global find-and-replace across all component CSS files, so do it once, not incrementally.