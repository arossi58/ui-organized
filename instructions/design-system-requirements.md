# Design System Ecosystem — Features & Requirements Overview

## System Overview

A white-label design system ecosystem that allows users to theme a component library through a web-based tool, then export that theme configuration for use in both Figma (via plugin) and code (via npm package). The system is stateless and file-based — no backend, no accounts, no sync service. A single JSON theme config file is the contract between every part of the ecosystem.

---

## Architecture Principles

- **Single source of truth:** The theme config JSON file is the baton passed at every handoff
- **Client-side only:** No backend, no auth, no database — purely file-based export/import
- **Build-time consumption:** The npm package resolves theme tokens at build time via Style Dictionary
- **Intelligence lives in the tool website:** Palette generation, type scale calculation, and rounding all happen in the browser — downstream consumers (npm package, Figma plugin) receive resolved values
- **Fixed system opinions:** Semantic token names, role-to-step mappings, spacing multipliers, and heading/body font assignments are defined by the design system — users configure values, not structure
- **DTCG separation:** The theme config is a custom format representing user decisions — it is an input to the token pipeline, not a DTCG file itself. The build step transforms it into DTCG-formatted tokens for Style Dictionary processing

---

## Theme Config JSON Schema

### Top-Level Structure

- **metadata** — theme name, schema version number, timestamp
- **color** — brand colors, UI/functional colors, neutral palette selection, opacity layering tokens
- **typography** — dual font configuration, type scale, semantic weight mappings
- **icons** — icon library selection, style preference, stroke weight adjustment
- **borderRadius** — named radius values (own Figma collection, separate from semantic tokens)
- **spacing** — single base unit value (own Figma collection, separate from semantic tokens)

### Color

- **User inputs (2 total):**
  - One brand color (stored in both OKLCH and hex)
  - One neutral preset identifier (selected from a curated preset library: dove, mythical, flint, waterloo, stone, cave, juniper, battleship, squirrel, hemp, mavic, shark)
- **System-generated from inputs:**
  - Full brand color shade ramp generated from the single brand color via OKLCH palette algorithm
  - Full neutral ramp provided by the selected preset
  - Functional/UI colors (success, warning, error, info) are system-owned — pre-defined ramps baked into the system, not user-configurable. These adjust for contrast per mode but the hues are fixed.
  - Secondary/accent colors derived algorithmically from brand color if needed (TBD: whether the component library requires a second hue, or if brand shade variations are sufficient)
- **Config storage (hybrid):**
  - Stores the two source inputs (brand color value + neutral preset ID) for human readability
  - Also stores the fully resolved generated values for portability — consumers don't need generation logic
- **Opacity layering tokens:**
  - Two named elevation levels: color-elevation/subtle (8% opacity) and color-elevation/medium (16% opacity)
  - The overlay color is a specific step from the selected neutral ramp, applied at the specified opacity
  - **Dark mode:** Uses the neutral 400 step (a lighter shade) at 8% and 16% — brightens layers above the base
  - **Light mode:** Uses the neutral 1400 step (a darker shade) at 8% and 16% — darkens layers above the base
  - The opacity percentages are constant across modes; the neutral step shifts per mode
  - This creates automatic visual separation when elements are nested — each layer appears distinct from its parent
  - Changing the neutral preset updates all layers automatically since they derive from the selected neutral's ramp
  - Overlay tokens are mode-dependent composite values (neutral step + opacity), not simple opacity numbers
  - Solid surface tokens (base, subtle, medium, emphasis, strong) remain for base-level surfaces — opacity layering complements them, does not replace them
  - Overlay values are system-owned (not user-configurable beyond neutral preset selection)
- **Semantic mappings (mode-dependent):**
  - Modes object containing named entries (light, dark, or arbitrary mode names)
  - Each mode is a complete map of semantic token names to primitive references
  - Every semantic color token requires an assignment in every mode
  - Tool website generates exactly two modes: light and dark
  - Figma plugin export supports arbitrary number of modes (discovered from Figma variable modes)
  - Schema structure is an open map — any number of arbitrarily named modes are valid

### Mode Support

- Modes affect **color semantic mappings only** — typography, border radius, and spacing are mode-independent
- Primitive color ramps are constant across all modes; only semantic-to-primitive assignments change
- npm package build step generates CSS structure for each mode (via data attributes or CSS classes that swap custom property values)
- With simplified color inputs (one brand + one neutral), light and dark mode mappings can be generated fully algorithmically with high confidence
- Tool website generates both modes automatically and shows preview with mode toggle — override UI only exposed if user explicitly needs it
- Figma plugin reads variable modes natively and maps each to a mode entry in the config
- Developer toggles modes in their app via data attributes or class-based switching

### Typography

- **Heading font** — Google Fonts family name + semantic weight mappings
- **Body font** — Google Fonts family name + semantic weight mappings (can be the same font as heading)
- **Type scale** — base size (rounded), ratio (metadata/reference only), resolved rounded values per semantic step
- **Weight mappings** — semantic role names as keys (regular, medium, semibold, bold), raw numeric weight values — only assigned roles are included
- **Line height and letter spacing** — values per step (TBD: user-configurable or system-calculated)
- Heading/body font boundary is a fixed system opinion (e.g., display/heading roles use heading font, body/caption/label roles use body font)

### Icons

- **Library selection:** One of the supported libraries — Lucide, Tabler, or Heroicons
- **Style preference:** Outline/stroke or solid/filled — available options depend on selected library
- **Stroke weight adjustment:**
  - Toggle: enabled or disabled
  - When enabled, stroke weight is adjusted algorithmically based on icon size so all icons appear optically weighted the same across sizes
  - The adjustment algorithm is system-owned (not user-configurable beyond the toggle) — extracted from the existing icon scaling tool
  - Only applies to stroke-based icon styles; ignored for solid/filled
- **Icon name mapping:** The system defines a canonical set of icon names used by components (e.g., `chevron-down`, `close`, `check`, `alert`, `search`). A mapping table in `packages/utils` resolves canonical names to each library's actual icon component names.
- **Bundle optimization:** Only the selected library's icons should be included in the final bundle — the Vite plugin handles tree-shaking or aliasing so unused libraries are excluded

### Border Radius

- Own Figma variable collection (separate from Primitive and Semantic collections)
- Named scale: radius-01 through radius-12 + radius-full (or similar)
- Each value set independently by the user (not derived from a base unit)
- Values stored as pixel numbers

### Spacing

- Own Figma variable collection (separate from Primitive and Semantic collections)
- Single base unit value (e.g., 4px or 8px)
- Fixed multipliers defined by the system (not user-configurable)
- Build pipeline generates the full spacing scale from base × multipliers

### Schema Versioning & Validation

- Schema version number at root level for forward compatibility and migration
- npm package build step validates config and provides clear error messages
- TypeScript type definitions published with npm package for DX (autocomplete + compile-time validation)
- Required vs. optional fields defined (optional fields have sensible defaults)

---

## Tool Website (Theme Builder)

### Purpose

Primary product experience where users make design decisions through a guided UI, preview changes on live components, and export the theme config file.

### Color Tools

- OKLCH color palette generator (existing tool, integrated as a feature)
- Single brand color picker with full generated ramp preview
- Neutral palette preset selector from curated library
- Contrast checking
- **Light/dark mode preview:** both modes generated algorithmically from brand + neutral inputs, mode toggle in preview, override UI available on demand

### Typography Tools

- Typescale-style interface for adjusting the type size scale
- Base size selection
- Scale ratio selection (preset ratios + custom)
- All calculated values round to the nearest practical number (whole pixels, or nearest even number if on a 4px grid — TBD)
- Rounded values are the source of truth, not the ratio
- Google Fonts integration via API — full font library, searchable
- Separate font picker for heading and body fonts
- Available weights queried dynamically per selected font
- Users assign raw numeric weights to semantic categories
- If a font lacks enough weights, unavailable semantic categories are simply not displayed
- Type specimen view showing full scale with semantic names + pixel values
- Warning/indicator when scale produces impractical sizes at extremes

### Icon Tools

- **Library selector:** Choose between Lucide, Tabler, or Heroicons — preview updates all component icons immediately
- **Style selector:** Choose outline/stroke or solid/filled — available styles shown dynamically based on selected library
- **Stroke weight adjustment toggle:** When enabled, previews icons with optically corrected stroke weights across sizes
- **Icon preview panel:** Shows a representative set of icons at multiple sizes to demonstrate optical weight consistency
- Icon scaling and export functionality (existing tool logic, integrated as a feature)

### Border Radius Controls

- Named value adjustment for each radius token
- Visual preview of radius changes on components

### Spacing Controls

- Base unit selection
- Preview of generated spacing scale from fixed multipliers

### Live Component Preview

- Renders actual Base UI components from the npm package (component library is a dependency of the tool website)
- Curated "kitchen sink" of component states — buttons, form inputs, cards, navigation, sample layouts
- Updates instantly via CSS custom property rewriting for color, radius, spacing changes
- Font changes load dynamically via Google Fonts API (small delay expected)
- Accurately reflects weight fallback behavior when fonts have limited weights
- **Mode toggle** to switch preview between light and dark modes
- Distinct from Storybook (which serves component development and story authoring) and Supernova (which serves consumer-facing documentation)

### Export

- Exports theme config as a JSON file (download)
- Fully resolved values — all generation/rounding complete before export
- File is immediately usable by both Figma plugin and npm package build pipeline

---

## Figma Plugin

### Purpose

Single plugin with three modes — import, export, and color adjustment. Internal data model is the theme config schema.

### Import Mode

- Reads a theme config JSON file
- Maps tokens to Figma variables via consistent naming conventions (direct name-based lookup)
- Creates or updates Figma variable modes to match the modes defined in the config (light, dark, or any custom modes)
- Decision TBD: destructive (overwrite all) vs. selective (pick categories to update)

### Export Mode

- Reads current Figma variable values across all variable modes
- Discovers modes from the Figma file (not limited to light/dark — supports arbitrary user-created modes)
- Maps each Figma variable mode to a mode entry in the config's modes object
- Writes them back to the theme config JSON format
- Handles edge case of Figma variables that don't have a schema equivalent (ignore, warn, or include as extensions — TBD)
- Enables designer-to-developer handoff: designer tweaks in Figma → export config → developer drops into project

### Color Adjustment Mode

- Existing OKLCH palette generator integrated into the plugin
- User picks a new brand color → plugin generates ramp → previews in plugin UI
- On confirmation, writes new values to Figma variables AND can export updated config
- Combines generation with import in a single flow

---

## npm Package (Component Library)

### Purpose

Ships the component library. Developers import it, point it to a theme config file, and get a fully themed system.

### Theme Consumption

- Build-time resolution via Style Dictionary pipeline
- Transform step: reads theme config → generates DTCG-formatted primitive tokens → Style Dictionary processes alongside fixed semantic and component token layers
- Components consume semantic tokens via CSS custom properties (or theme provider — TBD based on existing architecture)
- Generates CSS structure for each mode in the config (data attributes or class-based switching)
- Supports arbitrary number of modes — not hardcoded to light/dark

### Weight Fallback Handling

- Unassigned semantic weights fall back to nearest assigned weight
- Fallback behavior documented so users understand why variants may look identical with limited-weight fonts

### Icon Handling

- Icon component abstracts over Lucide, Tabler, and Heroicons — components never import directly from an icon library
- Icon libraries listed as peer dependencies — developer installs only the one specified in their theme config
- Vite plugin handles tree-shaking at build time so only the selected library's icons are bundled
- Stroke weight adjustment applied automatically when enabled in the config and the icon style is outline/stroke

### Developer Experience

- TypeScript type definitions for the config format
- Config validation with clear error messages at build time
- Single config file import — no manual token wiring needed
- Updates flow via new config file drops (from tool website or Figma plugin export)

---

## Documentation

### Two-Layer Approach

- **Storybook** — Development-facing component workshop. Interactive stories with controls, variant grids, theme toggling. Deployed publicly so Supernova can embed stories via native embedding. Not the consumer-facing documentation — kept focused on component stories only, no heavy MDX narrative docs.
- **Supernova** — Consumer-facing documentation hub. The single destination for designers, developers, and stakeholders to learn and use the design system. Embeds Storybook stories and Figma frames alongside written guidelines, usage rules, do's/don'ts, and token references.

### Supernova Content

- Component pages: embedded Figma designs + embedded Storybook stories + usage guidelines + do's and don'ts + token references + accessibility notes
- System pages: token architecture, color system, typography system, spacing/radius, theming guide, developer getting started
- Token documentation via Supernova's Design Token blocks (synced with Style Dictionary output)

### AI Integration

- Supernova MCP integration allows AI coding tools (Claude Code, Cursor, etc.) to access design system documentation as context
- Extends the `guidelines.md` approach — AI reads live documentation rather than a manually maintained file
- Set up after documentation has meaningful content

---

## Marketing Website

- Standalone site, architecturally simple
- Potential for embedded "lite" theme builder as interactive demo (adds scope — TBD)
- Separate from the tool website

---

## Data Flow

```
Tool Website (user makes theme decisions)
        │
        ▼
  Theme Config JSON (exported file)
        │
        ├──────────────────────┐
        ▼                      ▼
  Figma Plugin              npm Package
  (import → set             (build-time →
   variables)               Style Dictionary →
        │                    CSS custom props)
        │                         ▲
        ▼                         │
  Designer tweaks            Updated config
  in Figma                   dropped into
        │                    project
        ▼                         │
  Figma Plugin               ─────┘
  (export → new
   config JSON)
```

---

## Open Decisions

- **Type scale rounding target:** Whole pixels vs. nearest even number (depends on spacing grid alignment)
- **Line height / letter spacing:** User-configurable or system-calculated?
- **Figma import mode:** Destructive overwrite vs. selective category update?
- **Figma export edge cases:** How to handle variables with no schema equivalent?
- **Marketing site demo:** Include a lite theme builder or keep it purely informational?
- **Neutral preset library:** How many presets, and what defines each (warm, cool, true neutral, tinted)?
- **Secondary/accent color:** Does the component library require a second hue, or do brand shade variations cover all use cases?