# Theme Builder Website — Build Instructions

> Build instructions for `apps/builder`, the theme configuration tool website. This document covers Phase 1 (color, typography, radius, spacing, live preview, export). Phase 2 (icons) and Phase 3 (polish) are scoped at the end but not detailed here.

---

## Overview

The builder is a React + Vite application that lives in `apps/builder` within the monorepo. Users make design decisions through a guided UI, see those decisions reflected instantly on live components, and export a theme config JSON file compatible with the design system's Style Dictionary pipeline.

The builder's own UI is built with the design system's component library (`packages/react`). This means the component library must have enough components built to construct the builder interface before this work begins (at minimum: Button, Input, Select, Card, Tabs, and a layout system).

---

## Architecture

### State Management

The builder maintains a single state object that represents the in-progress theme configuration. Every UI control writes to this state. The live preview reads from this state. The export function serializes this state to JSON.

This state object should match the `ThemeConfig` type from `packages/schema` — or a superset of it that includes transient UI state (like "which panel is active") alongside the exportable config data. Keep a clear separation between config state (exported) and UI state (not exported).

Use React context or a lightweight state manager (zustand is a good fit) to make the config state accessible to all panels and the preview without prop drilling. Every control panel (color, typography, radius, spacing) reads and writes to the same state.

### Two-Zone Layout

The builder should be split into two zones:

**Controls zone (left/top):** Tabbed or stepped panels where users make design decisions. Each tab covers one theming category: Color, Typography, Border Radius, Spacing. A final Export tab/action assembles and downloads the config.

**Preview zone (right/bottom):** Renders actual components from `packages/react` styled with the current state. This zone updates in real time as the user changes values. On smaller screens, this could collapse to a toggle between controls and preview.

### How Live Preview Works

The preview zone wraps your actual design system components in a container element. When the user changes any value, the builder writes CSS custom properties directly onto that container element's `style` attribute (or via a `<style>` tag scoped to the preview). This is the same mechanism your components already use — they reference `var(--semantic-color-interactive-primary-default)`, and you're just swapping the value that property resolves to.

This means:
- Color changes: Write new color values to the preview container's custom properties. Instant update, no re-render needed.
- Typography changes: Write new font size values, update font family by loading the Google Font dynamically and writing `--typography-font-families-font`. Small delay for font loading.
- Radius changes: Write new radius values. Instant update.
- Spacing changes: Write new spacing values. Instant update.

The builder does NOT need to run Style Dictionary in the browser. It doesn't generate DTCG files in real time. It directly writes CSS custom properties to the preview DOM — skipping the build pipeline entirely for preview purposes. The build pipeline only matters when the developer consumes the exported config in their project.

**Critical:** The custom property names the builder writes to the preview container must EXACTLY match the names that Style Dictionary generates. Reference the output from `packages/tokens/output/variables.css` to get the exact property names. If the builder writes `--color-border-subtle` but Style Dictionary outputs `--semantic-color-border-subtle`, the preview won't match production. Use the same names.

---

## Phase 1 Features

### 1. Color Configuration

#### Brand Color Picker

- A color picker input (hex, with optional OKLCH display) where the user selects their one brand color
- On selection, the builder calls the OKLCH palette generation function from `packages/utils` to produce the full 16-step brand ramp
- Display the generated ramp as a visual strip of color swatches with step numbers (100–1600)
- Store both the source hex value and the full generated ramp in state

#### Neutral Preset Selector

- Display all 12 neutral presets as selectable visual swatches: dove, mythical, flint, waterloo, stone, cave, juniper, battleship, squirrel, hemp, mavic, shark
- Each preset shows a preview of its ramp (or at minimum the mid-range shades) so the user can see the tint/temperature
- On selection, the builder loads the preset's full 16-step ramp from `packages/utils` (where presets are defined as static data)
- The selected preset name is stored in state (for the config export), along with the resolved ramp values

#### How Neutral Selection Affects Semantic Tokens

This is the most important logic in the builder's color system. When the user selects a neutral preset, the semantic token mappings must update to reference the selected neutral's ramp instead of the default.

In your current Figma tokens, the semantic mappings use specific primitive ramps:
- `color-surface` references `shark` (base→shark.1600, subtle→shark.1500, etc.)
- `color-text` references `white` (primary→white.100, secondary→white.800, etc.)
- `color-border` references `black` (subtle→black.1100, medium→black.1000, etc.)
- `color-interactive.secondary` references `shark`
- `color-interactive.ui` references `shark`

When the user picks a different neutral (e.g., `flint`), the surface colors need to remap from shark steps to flint steps. The step numbers stay the same (the semantic mapping pattern is fixed), but the ramp changes.

Define a mapping function in `packages/utils` that takes a neutral preset name and returns the full semantic color mapping. This function encodes the fixed relationship: "surface-base always uses step 1600 of the selected neutral, surface-subtle always uses step 1500," and so on.

The `white` and `black` ramps are true neutrals (no tint) and stay constant regardless of preset selection — they provide the light and dark extremes. The selected preset provides the tinted mid-range neutral scale that surfaces, secondary interactive states, and similar UI elements use.

#### What the Preview Receives

When color state changes, the builder computes every semantic color custom property value and writes them to the preview container. For example, when the user picks brand color `#008ffb` and neutral preset `flint`:

```
--primitive-brand-100: #e2f2ff      (from OKLCH generation)
--primitive-brand-200: #c5e5ff      (from OKLCH generation)
...
--semantic-color-surface-base: #060609     (flint.1600 — mapped from selected neutral)
--semantic-color-surface-subtle: #0b0b10   (flint.1500)
--semantic-color-interactive-primary-default: #005aa5   (brand.1200)
...
```

All primitive values are written so that any semantic token using `var()` references resolves correctly.

#### Functional/Status Colors

Success, info, caution, warning, and error colors are system-owned. They are NOT configurable in the builder. The builder writes their fixed values to the preview container and includes them in the export as static resolved values. These come from the fixed ramps: lima (success), cerulean (info), caribbean (info-secondary), candlelight (caution), cerise (warning), crimson (error).

---

### 2. Typography Configuration

#### Type Scale Tool

Build a typescale.com-style interface:

- **Base size input:** Numeric input, default 16. This is the `body-large` reference size.
- **Scale ratio selector:** Dropdown with preset ratios (Minor Second 1.067, Major Second 1.125, Minor Third 1.2, Major Third 1.25, Perfect Fourth 1.333, Augmented Fourth 1.414, Perfect Fifth 1.5) plus a custom numeric input.
- **Calculated scale display:** Show each step name with its calculated and rounded pixel value:
  - `display-xlarge`
  - `display-large`
  - `display-medium`
  - `heading-large`
  - `heading-medium`
  - `heading-small`
  - `body-large` (this is the base)
  - `body-medium`
  - `body-small`
  - `caption`

Steps above `body-large` multiply up by the ratio. Steps below divide down.

- **Rounding:** All values round to the nearest whole pixel. The rounded values are the source of truth stored in state, not the raw calculated values.
- **Specimen view:** For each step, show the step name, the pixel value, and a sample text rendered at that size so users can see the visual progression.

Call the type scale calculation function from `packages/utils`. That function takes base size, ratio, and the fixed step names, and returns the rounded values.

#### Font Picker (Heading + Body)

- **Two font pickers** — one for heading font, one for body font. Each is a searchable dropdown.
- **Google Fonts API integration:** Fetch the full font list from the Google Fonts API. Display font names with a live preview of each font in the dropdown (load the font on hover or on display for a small preview string).
- **Weight detection:** When a font is selected, query its available weights from the API response. Display only the weights that font actually supports.
- **Semantic weight assignment:** Show the four semantic weight roles — Default, Emphasis, Strong, Heavy. For each role, the user picks from the selected font's available weights (numeric values: 100, 200, 300, 400, 500, 600, 700, 800, 900). If the font has fewer than 4 weights, only the available roles are shown.
- **Font loading for preview:** When the user selects a font, dynamically load it via the Google Fonts CSS API (`https://fonts.googleapis.com/css2?family=FontName:wght@400;500;600;700`) and inject the link into the document head. The preview container picks it up via the `--typography-font-families-font` custom property.

#### Which Steps Use Which Font

The heading/body split is a fixed system opinion encoded in the builder:
- **Heading font:** `display-xlarge`, `display-large`, `display-medium`, `heading-large`, `heading-medium`, `heading-small`
- **Body font:** `body-large`, `body-medium`, `body-small`, `caption`

Currently your Figma has a single font for everything. The builder supports dual fonts from the start. If the user picks the same font for both heading and body, that's valid — the system treats them as two separate config fields that happen to have the same value.

#### What the Preview Receives

```
--typography-font-families-font: 'Inter'        (or heading font)
--typography-font-families-default: 400          (mapped weight)
--typography-font-families-emphasis: 500
--typography-font-families-strong: 600
--typography-font-families-heavy: 700
--typography-font-size-display-xlarge: 64px
--typography-font-size-display-large: 48px
...
--typography-font-size-caption: 10px
```

Note: Once dual font support is wired into the component library, you'll split `--typography-font-families-font` into `--typography-font-heading` and `--typography-font-body`. For now, write both heading and body font values to separate properties even if the components only read one — this future-proofs the preview.

---

### 3. Border Radius Configuration

- Display each radius token as a named row with a numeric input and a visual preview square showing the radius applied to a corner:
  - `radius-01` through `radius-12` + `radius-full`
- Users adjust each value independently
- Values are pixel numbers
- `radius-full` should be fixed at 99999 (full pill shape) and not user-editable
- Show a mini component preview (e.g., a small card or button outline) next to the inputs that updates live as values change

#### What the Preview Receives

```
--semantic-border-radius-radius-01: 2px
--semantic-border-radius-radius-02: 4px
...
--semantic-border-radius-radius-12: 24px
--semantic-border-radius-radius-full: 99999px
```

---

### 4. Spacing Configuration

- **Base unit input:** A single numeric input (default 4). This is the fundamental unit.
- **Multiplier display:** Show the fixed multiplier table and the resulting values. The multipliers are system-owned and not user-editable:

| Token | Multiplier | Value (base=4) |
|---|---|---|
| space-005 | 0.5 | 2px |
| space-01 | 1 | 4px |
| space-015 | 1.5 | 6px |
| space-02 | 2 | 8px |
| space-025 | 2.5 | 10px |
| space-03 | 3 | 12px |
| space-04 | 4 | 16px |
| space-05 | 5 | 20px |
| space-06 | 6 | 24px |
| space-07 | 7 | 28px |
| space-08 | 8 | 32px |
| space-09 | 9 | 36px |
| space-10 | 10 | 40px |
| space-11 | 11 | 44px |
| space-12 | 12 | 48px |
| space-16 | 16 | 64px |
| space-32 | 32 | 128px |

- When the user changes the base unit, all values recalculate and the preview updates instantly
- Call the spacing generation function from `packages/utils`

#### What the Preview Receives

```
--semantic-spacing-space-005: 2px
--semantic-spacing-space-01: 4px
...
--semantic-spacing-space-32: 128px
```

---

### 5. Live Component Preview

#### Components to Show

Render a curated "kitchen sink" layout inside the preview zone using actual components from `packages/react`:

- **Buttons:** Primary, secondary, tertiary, ghost, destructive — in small, medium, large sizes. Include disabled states.
- **Inputs:** Text input with label, helper text. Show default, focus, error, and disabled states.
- **Select / Dropdown:** A dropdown in default and open states.
- **Checkboxes and Radios:** Checked, unchecked, disabled.
- **Switch / Toggle:** On and off states.
- **Cards:** A sample card with heading text, body text, and a button inside — this shows typography, surface colors, spacing, and radius together.
- **Badges:** A few status badges (success, warning, error, info) to show functional colors.
- **Alerts / Banners:** At least one alert showing status color usage.

This layout should feel like a realistic UI sample, not just isolated components. A small "dashboard" or "settings page" mockup is ideal — it gives context for how the theme choices work together.

#### Preview Container Implementation

```tsx
// Conceptual structure
<div 
  className="preview-container"
  style={generatedCustomProperties}  // all CSS custom properties written here
>
  {/* Import your component library's CSS */}
  {/* Render kitchen sink components */}
  <PreviewKitchenSink />
</div>
```

The `generatedCustomProperties` object is built from the current state. Every time any control changes, this object is recomputed and applied. React handles the style update efficiently since it's just a style prop change on the container.

The component library CSS (`@your-scope/react/styles.css`) is loaded once. The components inside the preview container resolve their `var()` references from the custom properties on the container, not from `:root`. This works because CSS custom properties inherit — properties set on a parent element cascade to all children.

#### Real-Time Update Flow

```
User changes a control value
    → State updates
    → CSS custom properties object recomputes
    → Preview container style prop updates
    → Components inside re-render with new token values
    → Visual update appears instantly (no build step, no page reload)
```

For color and spacing changes, this is instant. For font changes, there's a brief delay while the Google Font loads — show a loading indicator on the preview during font loading.

---

### 6. Export

#### Export Format

The export produces a JSON file that conforms to the `ThemeConfig` type from `packages/schema`. Validate the state against the schema before export — if validation fails, show the user what's wrong.

The exported JSON structure (Phase 1, without icons):

```json
{
  "metadata": {
    "name": "My Theme",
    "schemaVersion": "1.0.0",
    "timestamp": "2026-04-04T12:00:00Z"
  },
  "color": {
    "brandColor": {
      "hex": "#008ffb",
      "oklch": "oklch(0.67 0.18 240)"
    },
    "neutralPreset": "shark",
    "resolvedPrimitives": {
      "brand": {
        "100": { "hex": "#e2f2ff", "oklch": "oklch(...)" },
        "200": { "hex": "#c5e5ff", "oklch": "oklch(...)" },
        "...": "...",
        "1600": { "hex": "#001a33", "oklch": "oklch(...)" }
      },
      "neutral": {
        "100": { "hex": "#919baf", "oklch": "oklch(...)" },
        "...": "full selected neutral ramp"
      }
    },
    "modes": {
      "dark": {
        "color-surface-base": "neutral.1600",
        "color-surface-subtle": "neutral.1500",
        "color-surface-medium": "neutral.1400",
        "color-surface-emphasis": "neutral.1300",
        "color-surface-strong": "neutral.1200",
        "color-text-primary": "white.100",
        "color-text-secondary": "white.800",
        "color-text-tertiary": "white.1100",
        "color-text-placeholder": "white.1100",
        "color-text-inverse": "black.1600",
        "color-text-interactive": "white.100",
        "color-border-subtle": "black.1100",
        "color-border-medium": "black.1000",
        "color-border-emphasis": "black.900",
        "color-border-strong": "black.800",
        "color-border-data-entry": "black.700",
        "color-interactive-primary-default": "brand.1200",
        "color-interactive-primary-hover": "brand.1400",
        "color-interactive-primary-active": "brand.1600",
        "color-interactive-primary-selected": "brand.1200",
        "color-interactive-secondary-default": "neutral.1100",
        "color-interactive-secondary-hover": "neutral.900",
        "color-interactive-secondary-active": "neutral.700",
        "color-interactive-secondary-selected": "neutral.900",
        "color-interactive-tertiary-default": "brand.900",
        "color-interactive-tertiary-hover": "brand.700",
        "color-interactive-tertiary-active": "brand.600",
        "color-interactive-tertiary-selected": "brand.1000",
        "color-interactive-ghost-default": "transparent",
        "color-interactive-ghost-hover": "black.800",
        "color-interactive-ghost-active": "black.1000",
        "color-interactive-ui-default": "neutral.1300",
        "color-interactive-ui-hover": "neutral.1100",
        "color-interactive-ui-active": "neutral.1200",
        "color-interactive-ui-selected": "neutral.1200",
        "color-interactive-contents": "white.100",
        "color-interactive-focus": "white.100",
        "color-interactive-focus-inverse": "black.1600",
        "color-interactive-inactive-01": "black.600",
        "color-interactive-inactive-02": "black.400",
        "color-interactive-inactive-03": "black.200",
        "color-icon-primary": "white.100",
        "color-icon-secondary": "white.800",
        "color-icon-tertiary": "white.1100",
        "color-status-success": "lima.1300",
        "color-status-success-bg": "lima.1600",
        "color-status-success-content": "lima.300",
        "...": "...all remaining status colors"
      }
    }
  },
  "typography": {
    "headingFont": {
      "family": "Inter",
      "weights": {
        "default": 400,
        "emphasis": 500,
        "strong": 600,
        "heavy": 700
      }
    },
    "bodyFont": {
      "family": "Inter",
      "weights": {
        "default": 400,
        "emphasis": 500,
        "strong": 600,
        "heavy": 700
      }
    },
    "scale": {
      "base": 16,
      "ratio": 1.25,
      "steps": {
        "display-xlarge": 64,
        "display-large": 48,
        "display-medium": 40,
        "heading-large": 32,
        "heading-medium": 24,
        "heading-small": 20,
        "body-large": 16,
        "body-medium": 14,
        "body-small": 12,
        "caption": 10
      }
    }
  },
  "borderRadius": {
    "radius-01": 2,
    "radius-02": 4,
    "radius-03": 6,
    "radius-04": 8,
    "radius-05": 10,
    "radius-06": 12,
    "radius-07": 14,
    "radius-08": 16,
    "radius-09": 18,
    "radius-10": 20,
    "radius-11": 22,
    "radius-12": 24,
    "radius-full": 99999
  },
  "spacing": {
    "baseUnit": 4
  }
}
```

#### Key Points About the Export

**The `modes` object uses semantic token names as keys and primitive references as values.** The references use `neutral.XXX` (not the specific preset name) so the build pipeline knows to resolve against whichever neutral ramp was selected. The `neutralPreset` field identifies which preset to use.

**The `resolvedPrimitives` section includes the fully expanded ramps** so downstream consumers don't need to run palette generation. The brand ramp is generated from the source color. The neutral ramp is the selected preset's values. Both are stored in hex and OKLCH.

**Typography stores both the source inputs (base, ratio) and the resolved steps.** The resolved rounded values are the source of truth. The base and ratio are metadata for reference.

**Spacing stores only the base unit.** The multipliers are a system opinion and don't need to be in the config — the build pipeline knows them.

#### Export Action

- A "Download Theme" button (or similar) at the bottom of the controls zone or in a dedicated export panel
- Validate the config state against the Zod schema from `packages/schema`
- If validation passes, serialize to JSON and trigger a browser file download (`theme.json`)
- If validation fails, display the specific errors to the user
- Allow the user to set the theme name before export (this populates `metadata.name`)

---

## Compatibility With Style Dictionary

The exported JSON is NOT a Style Dictionary input file. It is your custom theme config format. The pipeline works like this:

```
Builder exports theme.json (custom schema)
    → Developer drops theme.json into their project
    → packages/tokens transform script reads theme.json
    → Transform script generates DTCG token files from the config:
        - Expands brand ramp into primitive/colors.json
        - Loads neutral preset ramp into primitive/colors.json
        - Loads fixed functional color ramps
        - Writes semantic color files using the modes mappings
        - Writes typography, spacing, radius, dimension files
    → Style Dictionary processes the DTCG files
    → CSS custom properties output
    → Components consume the properties
```

The transform script in `packages/tokens` is the adapter between your custom config format and Style Dictionary's DTCG input. The builder doesn't need to know about Style Dictionary — it only needs to produce a valid `ThemeConfig` JSON.

**Ensure compatibility by:** importing the `ThemeConfig` type and `validateConfig` function from `packages/schema` in the builder. If the builder can't produce a config that passes validation, the pipeline can't consume it. The schema IS the contract.

---

## Project Structure

```
apps/builder/
├── index.html
├── vite.config.ts
├── src/
│   ├── main.tsx                      # Entry point, loads fonts + token CSS
│   ├── App.tsx                       # Root layout with controls + preview zones
│   ├── state/
│   │   └── themeState.ts             # Central theme config state (zustand or context)
│   ├── panels/
│   │   ├── ColorPanel.tsx            # Brand color picker + neutral preset selector
│   │   ├── TypographyPanel.tsx       # Font pickers + type scale tool
│   │   ├── BorderRadiusPanel.tsx     # Radius value inputs
│   │   ├── SpacingPanel.tsx          # Base unit input + multiplier display
│   │   └── ExportPanel.tsx           # Theme name input + download button
│   ├── preview/
│   │   ├── PreviewContainer.tsx      # Wrapper that applies CSS custom properties
│   │   ├── PreviewKitchenSink.tsx    # Layout of actual components
│   │   └── usePreviewProperties.ts   # Hook that computes CSS properties from state
│   ├── hooks/
│   │   ├── useGoogleFonts.ts         # Google Fonts API fetch + font loading
│   │   └── useExport.ts             # Validation + JSON download logic
│   └── utils/
│       └── semanticMapping.ts        # Maps neutral preset + brand → semantic property values
```

---

## Dependencies

The builder imports from these monorepo packages:
- `@your-scope/schema` — `ThemeConfig` type and `validateConfig`
- `@your-scope/utils` — color generation, type scale calculation, spacing generation, neutral preset data
- `@your-scope/react` — component library (rendered in preview)
- `@your-scope/tokens` — the generated CSS file (loaded as the preview's base styles)

External dependencies:
- `zustand` (or React context) for state management
- Google Fonts API (external HTTP, no npm package needed)
- A color picker component (build one from your design system or use a minimal dependency)

---

## Phase 2 Scope (Icons — Build Later)

- Add an Icons panel to the controls zone
- Library selector (Lucide, Tabler, Heroicons) — loads the selected library dynamically
- Style selector (outline/solid) — filtered by library
- Stroke weight adjustment toggle
- Icon preview panel showing representative icons at multiple sizes
- Preview kitchen sink updates to show icons in components (buttons with icons, alert icons, etc.)
- Export adds `icons` section to the theme config JSON

## Phase 3 Scope (Polish — Build Later)

- Light/dark mode toggle in preview (requires mode generation algorithm in `packages/utils`)
- Undo/redo for all controls
- Import existing config (load a previously exported JSON to continue editing)
- Preset starter themes (pre-configured configs users can start from)
- Responsive preview (toggle between desktop and mobile preview widths)
- Accessibility contrast checking integrated into the color panel
- Shareable preview links (encode config in URL — optional, adds complexity)
