# Design System — Build Instructions

> These instructions are for AI-assisted development (vibe coding) of a white-label design system. Read the companion document `design-system-requirements.md` for full feature and product requirements. This document covers architecture, setup, patterns, and implementation guidance.

---

## Project Overview

This is a white-label design system built on Base UI (headless React components). Users theme the component library through a web tool, then export a JSON config file that works in both Figma (via plugin) and code (via this npm package). The system is stateless and file-based — no backend.

The codebase is structured as a monorepo with a clear separation between framework-agnostic packages (tokens, schema, utilities) and framework-specific packages (React components today, other frameworks later). This separation is critical — do not put framework-specific code in shared packages.

---

## Monorepo Structure

```
packages/
├── schema/                  # Theme config schema (Zod + TypeScript types)
├── tokens/                  # Style Dictionary pipeline + token definitions
├── utils/                   # Shared utilities (color generation, type scale math)
├── react/                   # React component library (Base UI + custom CSS + CVA)
├── react-vite/              # Vite plugin for build-time theme resolution (React)
apps/
├── storybook/               # Storybook — component dev + interactive stories (deployed publicly for Supernova embedding)
├── builder/                 # Theme builder tool website (Vite + React)
├── marketing/               # Marketing website
tooling/
├── figma-plugin/            # Unified Figma plugin (import/export/color adjust)
├── tsconfig/                # Shared TypeScript configs
├── eslint-config/           # Shared ESLint configs
```

### Package Responsibilities

**`packages/schema`** — The contract. Defines the theme config JSON structure using Zod. Exports inferred TypeScript types AND runtime validation functions. Every other package that reads or writes a theme config imports from here. This package has zero framework dependencies — it is pure TypeScript + Zod. If you are tempted to import React or any framework here, stop. That is wrong.

**`packages/tokens`** — The token pipeline. Contains the fixed semantic and component token definitions (the parts of the token system that do NOT change between themes). Contains the Style Dictionary configuration and the transform function that converts a validated theme config into DTCG-formatted primitive tokens. Style Dictionary then merges these generated primitives with the fixed semantic/component layers to produce final output (CSS custom properties, etc). This package depends on `schema` for types.

**`packages/utils`** — Framework-agnostic utility functions. OKLCH color palette generation algorithm, type scale calculation and rounding logic, spacing scale generation from base unit, weight fallback resolution, icon name mapping table (canonical names → library-specific names for Lucide/Tabler/Heroicons), and icon stroke weight adjustment algorithm. These are pure functions with no side effects and no framework dependencies. Both the React component library and the theme builder website import from here. If future framework implementations are added (Vue, Svelte), they also import from here — the logic is written once.

**`packages/react`** — The React component library. Built on Base UI for accessibility primitives. Styled with custom CSS and Class Variance Authority (CVA) for variant management. Each component has its own `.css` file that references CSS custom properties from the token pipeline — components never hardcode color, spacing, type, or radius values. Includes a foundational Icon component that abstracts over the three supported icon libraries. This package depends on `schema` (for types), `tokens` (for the generated CSS), and `utils` (for weight fallback logic, icon mapping, and stroke adjustment). Icon libraries (lucide-react, @tabler/icons-react, @heroicons/react) are peer dependencies. This is the only package that imports React and Base UI.

**`packages/react-vite`** — A Vite plugin that integrates the token build pipeline into a consuming project's Vite build. Reads the theme config file, runs validation via `schema`, runs the transform via `tokens`, and outputs the generated CSS. Handles icon library tree-shaking — only the icon library specified in the theme config is included in the final bundle. This is what makes the developer experience seamless — drop in a config file, point the plugin at it, and the build handles everything.

---

## Technology Stack

| Concern | Tool | Notes |
|---|---|---|
| Monorepo | Turborepo + pnpm | pnpm workspaces for package linking |
| Build (library) | tsup or Vite library mode | Tree-shakeable ESM output |
| Build (apps) | Vite | Fast dev server, React plugin |
| Components | Base UI (headless) | Accessibility primitives, unstyled |
| Styling | Custom CSS + CVA | Component CSS referencing CSS custom properties, CVA for variant class management |
| Tokens | Style Dictionary v4 | DTCG format, custom transforms |
| Schema | Zod | Runtime validation + type inference |
| Component dev | Storybook | Interactive component stories, variant testing, theme toggle |
| Documentation | Supernova | Consumer-facing docs — embeds Storybook + Figma, guidelines, usage rules |
| Testing | Vitest | Unit + integration tests |
| Type checking | TypeScript (strict) | Shared tsconfig base |

---

## Setup Sequence

Follow this order. Each step builds on the previous one. Do not skip ahead.

### Step 1: Monorepo Scaffolding

Initialize the monorepo with Turborepo and pnpm. Create the directory structure above. Set up the root `pnpm-workspace.yaml` and root `package.json` with shared dev dependencies (TypeScript, ESLint, Prettier). Set up shared `tsconfig` base configurations. Verify that `pnpm install` and `turbo build` work with empty packages before adding any code.

### Step 2: Schema Package

This is the first package to build because everything depends on it.

Define the theme config schema using Zod. The schema must validate:
- `metadata` — name (string), schemaVersion (semver string), timestamp (ISO string, optional)
- `color` — brandColor object with `hex` (string) and `oklch` (string) fields, neutralPreset (string enum of available preset names), resolvedPrimitives (the fully expanded color ramps — brand and neutral), elevation (subtle and medium opacity values + darkModeStep/lightModeStep numbers), modes (Record of mode names to semantic mapping objects)
- `typography` — headingFont object (family string, weights Record mapping semantic role to number), bodyFont object (same shape), scale object (base number, ratio number as metadata, steps Record mapping semantic step name to rounded pixel number)
- `icons` — library (enum: "lucide" | "tabler" | "heroicons"), style (enum: "outline" | "solid"), strokeAdjustment (boolean)
- `borderRadius` — Record of named sizes (radius-01 through radius-12 + radius-full) to pixel numbers (own Figma collection)
- `spacing` — baseUnit (number) (own Figma collection)

Export the inferred TypeScript type: `export type ThemeConfig = z.infer<typeof themeConfigSchema>`

Export a validation function: `export function validateConfig(input: unknown): ThemeConfig` that throws descriptive errors on invalid input.

Write tests: valid config passes, missing required fields fail with clear messages, invalid value types fail, edge cases (empty weights, zero base unit, etc.) fail.

Create one complete example config file (`example-theme.json`) with realistic values to use as a reference and test fixture throughout development.

### Step 3: Utils Package

Build the pure utility functions that contain the system's intelligence.

**Color generation:** Port your existing OKLCH palette generation algorithm to a TypeScript function. Input: a single color (hex or OKLCH). Output: a full shade ramp (array of color objects, each with hex and OKLCH representations). This is the same algorithm your Figma plugin uses — extract it into this shared package so the logic exists in one place.

**Neutral presets:** Define the preset library as a data structure. Each preset is a named set of pre-generated neutral color ramps. Include all 12 presets: dove, mythical, flint, waterloo, stone, cave, juniper, battleship, squirrel, hemp, mavic, shark. These are static data, not generated at runtime.

**Elevation layering:** Define the two elevation levels (color-elevation/subtle at 8%, color-elevation/medium at 16%) and the mode-dependent neutral step mapping (dark mode uses step 400, light mode uses step 1400). Include a utility function that takes the selected neutral preset, the current mode, and the elevation level, and returns the computed composite color value (the neutral step's color at the specified opacity). This function is called by the builder's preview and by the token pipeline during build.

**Type scale:** Function that takes a base size and ratio, calculates each scale step, and rounds to the nearest target value. Input: base (number), ratio (number), steps (array of step names). Output: Record of step name to rounded pixel value. The step names and their order are fixed system opinions defined here.

**Spacing:** Function that takes a base unit and returns the full spacing scale using fixed multipliers. The multipliers are defined here as system opinions.

**Mode generation:** Function that takes resolved primitive color ramps (brand + neutral + functional) and generates semantic mapping objects for light and dark modes. This encodes the algorithmic rules for which primitives map to which semantic roles in each mode. This is the most complex utility and should be built carefully with tests for contrast ratios and visual correctness.

**Weight fallback:** Function that takes a set of assigned semantic weights and resolves any unassigned roles to the nearest available weight.

**Icon name mapping:** Define the canonical set of icon names used by the design system (e.g., `chevron-down`, `close`, `check`, `alert`, `search`, `arrow-left`, etc.). Maintain a mapping table that resolves each canonical name to the actual icon component name in each library (Lucide, Tabler, Heroicons). This is a static data structure, not a runtime function. It enables the React component library (and future framework implementations) to render the correct icon regardless of which library is active.

**Icon stroke adjustment:** Port your existing stroke weight adjustment algorithm from the icon scaling tool. Input: icon size (number). Output: adjusted stroke width (number). This is the optical correction function that makes icons appear consistently weighted across sizes. Pure math, no framework dependency.

Write thorough tests for every utility. These are pure functions — they are easy to test and must be reliable since the entire system depends on them.

### Step 4: Tokens Package

Set up Style Dictionary v4 with DTCG format configuration.

Define the **fixed** token layers — these do NOT change between themes:
- Semantic tokens that alias primitives (e.g., `color.background.primary` → `{color.neutral.50}`)
- Component tokens that alias semantics (e.g., `button.background.default` → `{color.background.interactive}`)

Build the **transform function** that:
1. Accepts a validated `ThemeConfig` (typed from the schema package)
2. Calls utils to expand any values if needed (though the config already contains resolved values)
3. Outputs DTCG-formatted primitive token files that Style Dictionary can process
4. Generates mode-specific semantic overrides from the config's modes object

Configure Style Dictionary to:
1. Read the generated primitive tokens
2. Read the fixed semantic and component token layers
3. Resolve all aliases
4. Output CSS custom properties, with mode-specific properties scoped to data attributes (e.g., `[data-theme="dark"]`)

Write integration tests: feed the example config through the full pipeline and assert the CSS output contains expected custom property names and values.

### Step 5: React Component Library

This is where Base UI, custom CSS, and CVA come together.

**Component architecture pattern — follow this for every component:**

Each component gets its own directory under `packages/react/src/components/[ComponentName]/`:
- `[ComponentName].tsx` — The component implementation
- `[ComponentName].styles.ts` — CVA variant definitions using custom CSS class names
- `[ComponentName].css` — Component stylesheet referencing CSS custom properties
- `[ComponentName].types.ts` — TypeScript prop types
- `index.ts` — Public exports

**Base UI integration pattern:**

```
Base UI provides:     Headless behavior, accessibility (ARIA, keyboard, focus)
Your system adds:     Visual styling via custom CSS + CVA, design token consumption
```

Every component wraps a Base UI primitive (or composition of primitives) and applies styling through custom CSS classes that reference your CSS custom properties. Components NEVER hardcode design values. Every color, spacing, radius, and typography value comes from a CSS custom property that the token pipeline generates.

**CVA with custom CSS classes:**

CVA is a class string builder — it does not require Tailwind. Instead of Tailwind utility classes, CVA maps variant combinations to your own BEM-style or namespaced CSS class names. The component's `.css` file defines those classes using CSS custom properties.

Example pattern (conceptual, not literal code):

In `Button.styles.ts`:
```ts
import { cva } from 'class-variance-authority'

export const buttonStyles = cva('btn', {
  variants: {
    intent: {
      primary: 'btn--primary',
      secondary: 'btn--secondary',
      ghost: 'btn--ghost',
    },
    size: {
      sm: 'btn--sm',
      md: 'btn--md',
      lg: 'btn--lg',
    },
  },
  defaultVariants: {
    intent: 'primary',
    size: 'md',
  },
})
```

In `Button.css`:
```css
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  font-family: var(--type-font-body);
  font-weight: var(--type-weight-medium);
  cursor: pointer;
  transition: background-color 150ms ease, color 150ms ease;
}

/* --- Intent variants --- */
.btn--primary {
  background-color: var(--color-bg-interactive);
  color: var(--color-fg-on-interactive);
}
.btn--primary:hover {
  background-color: var(--color-bg-interactive-hover);
}

.btn--secondary {
  background-color: var(--color-bg-secondary);
  color: var(--color-fg-secondary);
  border: 1px solid var(--color-border-default);
}

.btn--ghost {
  background-color: transparent;
  color: var(--color-fg-interactive);
}

/* --- Size variants --- */
.btn--sm {
  padding: var(--spacing-1) var(--spacing-2);
  font-size: var(--type-size-body-sm);
}
.btn--md {
  padding: var(--spacing-2) var(--spacing-4);
  font-size: var(--type-size-body);
}
.btn--lg {
  padding: var(--spacing-3) var(--spacing-6);
  font-size: var(--type-size-subheading);
}
```

In `Button.tsx`:
```tsx
import { Button as BaseButton } from '@base-ui-components/react/button'
import { buttonStyles } from './Button.styles'
import type { ButtonProps } from './Button.types'
import './Button.css'

export function Button({ intent, size, className, ...props }: ButtonProps) {
  return (
    <BaseButton className={buttonStyles({ intent, size, className })} {...props} />
  )
}
```

**Styling rules:**
- All color values: `var(--color-*)` custom properties from the token pipeline
- All spacing values: `var(--spacing-*)` custom properties
- All border radius: `var(--radius-*)` custom properties
- All typography sizes: `var(--type-size-*)` custom properties
- All font weights: `var(--type-weight-*)` custom properties
- All font families: `var(--type-font-heading)` and `var(--type-font-body)` custom properties
- NEVER hardcode color values (no `#3b82f6`, no `rgb()`, no `hsl()`)
- NEVER hardcode spacing or sizing values (no `padding: 12px`, no `gap: 8px`)
- NEVER use Tailwind — it is not a dependency of the component library
- Layout properties that are not themeable (display, position, flex alignment) use standard CSS values directly

**CSS class naming convention:**

Use a consistent namespaced pattern across all components to avoid collisions:
- Base class: component name, lowercase (e.g., `btn`, `input`, `card`)
- Variants: double-dash modifier (e.g., `btn--primary`, `btn--sm`)
- Child elements: double-underscore (e.g., `input__label`, `input__helper-text`)
- States: applied via pseudo-classes in CSS (`:hover`, `:focus-visible`, `:disabled`, `[data-state]`) rather than separate state classes where possible

**Component build priority — start with these foundational components:**
1. Icon (the abstraction layer — resolves canonical icon names to the active library, applies stroke adjustment)
2. Button (primary, secondary, ghost, destructive variants + sizes — includes icon slot)
3. Input (text, with label, helper text, error states)
4. Select / Dropdown
5. Checkbox
6. Radio
7. Switch / Toggle
8. Card (container component)
9. Badge
10. Alert / Banner
11. Tabs

Build each one fully (all variants, all states, accessible, tested) before moving to the next. Do not scaffold 20 empty components — build 11 complete ones.

**Icon component architecture:**

The Icon component is a special foundational component that other components depend on. It:
1. Accepts a canonical icon name (from your system's defined set) and a size
2. Reads the active icon library and style from the theme context
3. Looks up the correct icon component from the mapping table in `packages/utils`
4. If stroke adjustment is enabled and the style is outline/stroke, calculates the adjusted stroke width using the utility function and applies it to the SVG
5. Renders the resolved icon with the correct size and stroke weight

Components like Button, Input, Select, and Alert use the Icon component internally for their icon slots. They never import directly from Lucide, Tabler, or Heroicons.

**Bundle optimization:** All three icon libraries should NOT be bundled together. The Vite plugin (`packages/react-vite`) should handle this at build time — reading the icon library selection from the theme config and aliasing or tree-shaking so only the selected library's icons are included in the final output. During development and in the theme builder tool, all three may be loaded since the user can switch between them.

**Package output:**
- ESM build with tree-shaking support
- Bundled CSS file containing all component styles + base/default token values (generated by the token pipeline)
- TypeScript declarations
- Package exports map in `package.json` for clean imports: `import { Button } from '@your-scope/react'`
- Consuming projects import the CSS once: `import '@your-scope/react/styles.css'`
- Icon libraries listed as peer dependencies — consuming projects install only the one they need

### Step 6: Storybook (Component Development & Stories)

Set up Storybook in the `apps/storybook` app, consuming the React component library.

Storybook serves as the **development-facing** component workshop. It is NOT the final documentation deliverable — that role belongs to Supernova. Storybook stories will be embedded into Supernova pages, so story quality matters: they need to be polished, not just developer test fixtures.

Each component gets a story file that shows:
- All variants in a grid
- All sizes
- Interactive controls (args/knobs) with sensible defaults
- Dark mode toggle (switching the data attribute to show mode theming — use the Storybook themes addon so Supernova can expose the theme switcher in embedded stories)
- Accessibility notes

Set up a "kitchen sink" story that renders all components together on a sample page layout — this same layout concept will be reused in the theme builder tool.

**Deployment:** Storybook must be deployed as a publicly accessible site (or behind a VPN if restricting access). Supernova's native embedding requires a live URL to your Storybook instance. Use Chromatic, Vercel, Netlify, or any static hosting. The deployed URL is configured once in Supernova's styleguide settings and all embedded stories pull from it automatically.

**Do NOT invest in:** Custom Storybook themes, heavy MDX documentation pages, or elaborate Storybook-specific docs. Keep Storybook focused on interactive component stories. All narrative documentation (guidelines, usage rules, design principles, do's and don'ts) goes in Supernova.

### Step 7 (parallel): Supernova Documentation

Supernova is the **consumer-facing** documentation hub where designers, developers, and stakeholders go to understand the design system. It is not part of the monorepo codebase — it is a hosted platform you configure through its web interface.

**Setup:**
1. Create a Supernova design system
2. Connect your deployed Storybook URL as a data source — this makes all stories available for native embedding
3. Connect your Figma file — Figma components and frames can be embedded alongside code components
4. Set up the page structure for your documentation

**Page structure per component:**
- Figma design frames showing the component's design spec
- Embedded Storybook stories showing the live interactive component with controls
- Usage guidelines — when to use, when not to use
- Do's and don'ts with visual examples
- Token references — which tokens the component consumes
- Accessibility notes
- Related components

**System-level pages:**
- Token architecture overview (primitive → semantic → component layers)
- Color system documentation (brand color, neutral presets, mode behavior)
- Typography system documentation (type scale, font roles, weight mapping)
- Spacing and radius documentation
- Theming guide — how to use the theme config, how to set up the Vite plugin
- Getting started guide for developers

**Token documentation:** Use Supernova's Design Token blocks to display token values. These can be kept in sync with your Style Dictionary output.

**MCP integration:** Supernova supports MCP, which means your design system documentation can be connected to AI coding tools (Claude Code, Cursor, etc.) as a context source. This extends your `guidelines.md` approach — instead of manually maintaining guidelines, AI tools can read your live Supernova documentation for component usage rules, token references, and patterns. Set this up once the documentation has meaningful content.

**Timing:** Supernova documentation can be started as soon as you have your first few components built and deployed to Storybook. It doesn't block any code work, and can be built incrementally as components are completed. Each time you finish a component (implementation + story), create its Supernova page.

### Step 8: Vite Plugin (`react-vite`)

Build a Vite plugin that automates theme consumption for developers.

The plugin:
1. Accepts a config option pointing to the theme config JSON file path
2. On build start, reads and validates the config using the schema package
3. Runs the token pipeline from the tokens package
4. Injects the generated CSS into the build
5. On dev server, watches the config file for changes and hot-reloads token updates

A developer's integration looks like:
```js
// vite.config.js
import { themePlugin } from '@your-scope/react-vite'

export default {
  plugins: [
    themePlugin({ config: './theme.json' })
  ]
}
```

That's the entire developer-side setup. Install the package, add the plugin, drop in the config file.

---

## Critical Architecture Rules

These rules protect the system's ability to expand to other frameworks later. Follow them strictly.

1. **No React in shared packages.** The `schema`, `tokens`, and `utils` packages must never import React, ReactDOM, or any React-specific API. They are pure TypeScript. When you build a Vue or Svelte component library later, those packages are reused as-is.

2. **Components consume tokens via CSS custom properties only.** Components do not import token values as JavaScript objects. They reference CSS custom properties. This means the styling mechanism is framework-agnostic at the token level — any framework that renders HTML and CSS can consume the same token output.

3. **Base UI is an implementation detail of `packages/react`.** No other package references Base UI. If you build `packages/vue` later, it will use a different headless library (like Headless UI for Vue or Radix Vue). The shared packages don't know or care.

4. **The theme config schema is the API contract.** Any tool that reads or writes a theme config (the builder website, the Figma plugin, the Vite plugin, the token pipeline) imports from `packages/schema`. Changes to the schema are versioned and propagated to all consumers through the monorepo's type system.

5. **Design opinions live in `packages/utils` and `packages/tokens`.** The semantic token names, the scale step definitions, the spacing multipliers, the mode generation algorithm, the weight fallback logic — these are the design system's opinions and they are defined in the shared packages, not in the React components. A component should never make a design decision — it should reference a token.

6. **One component, one directory, fully complete.** Do not create partial components. Every component directory must contain the implementation, styles, types, and exports. If a component isn't ready to be used, it shouldn't exist yet.

7. **No Tailwind in the component library.** The component library owns its CSS entirely. Every component has a `.css` file with custom classes that reference CSS custom properties. This avoids forcing a Tailwind dependency on consuming projects and gives full control over the stylesheet. CVA manages variant class selection; the CSS files define what those classes do.

8. **Component CSS is portable.** Because component styles are plain CSS referencing CSS custom properties (not framework-specific styling like CSS-in-JS or Tailwind), the stylesheets can potentially be shared across framework implementations. A Vue or Svelte version of a component can import the same `.css` file — only the component logic changes.

---

## File Naming Conventions

- Component files: PascalCase (`Button.tsx`, `Button.styles.ts`, `Button.css`, `Button.types.ts`)
- Utility files: camelCase (`colorGeneration.ts`, `typeScale.ts`)
- Token files: kebab-case (`semantic-color.json`, `component-button.json`)
- Test files: same name as source with `.test.ts` suffix (`colorGeneration.test.ts`)
- Story files: same name as component with `.stories.tsx` suffix (`Button.stories.tsx`)

---

## Token Naming Conventions

Follow this Category-Type-Item pattern consistently across the entire system.

### CSS Custom Property Names

```
Color primitives:    --color-brand-{step}          e.g., --color-brand-500
                     --color-neutral-{step}         e.g., --color-neutral-100
                     --color-{functional}-{step}    e.g., --color-error-500

Color semantics:     --color-bg-{name}              e.g., --color-bg-primary
                     --color-fg-{name}              e.g., --color-fg-primary
                     --color-border-{name}          e.g., --color-border-default

Typography:          --type-font-heading
                     --type-font-body
                     --type-size-{step}             e.g., --type-size-body, --type-size-heading
                     --type-weight-{role}           e.g., --type-weight-regular, --type-weight-bold
                     --type-leading-{step}          e.g., --type-leading-body (line-height)

Border radius:       --radius-{size}                e.g., --radius-md, --radius-full

Spacing:             --spacing-{step}               e.g., --spacing-1, --spacing-4
```

These names are what components reference in their CSS files via the `var()` syntax. They must be stable — changing a name is a breaking change for every component that uses it.

---

## Development Workflow

### Building

```bash
pnpm install                    # Install all dependencies
turbo build                     # Build all packages in dependency order
turbo dev                       # Run dev servers (Storybook, builder app)
turbo test                      # Run all tests
turbo lint                      # Lint all packages
```

Turborepo handles the build order based on package dependencies. The dependency graph flows: `schema` → `utils` → `tokens` → `react` → `apps/*`.

### Adding a New Component

1. Create the component directory in `packages/react/src/components/`
2. Implement the component wrapping the appropriate Base UI primitive
3. Define CVA variants using custom CSS class names, write component CSS referencing CSS custom properties
4. Export from the package's root `index.ts`
5. Add Storybook stories in `apps/storybook` (polished, with controls and theme toggle)
6. Add to the kitchen sink layout story
7. Write tests
8. Create the component's Supernova page (embed stories, add Figma frames, write usage guidelines)

### Modifying the Theme Config Schema

1. Update the Zod schema in `packages/schema`
2. Run `turbo build` — TypeScript will surface every consumer that needs updating
3. Update the transform function in `packages/tokens`
4. Update the example config file
5. Run all tests to catch regressions
6. Increment the schema version

---

## What NOT to Build Yet

- User accounts, persistence, or any backend functionality
- Multi-brand management (one config = one brand for now)
- Animations or motion tokens (add after core is stable)
- Complex layout components (data tables, modals, navigation menus — do these after foundational components)
- React Native or any non-web platform support
- The marketing website (build last, after the product works)
- The theme builder tool website (build after the component library is solid)
- The Figma plugin (build after the schema and token pipeline are proven)
- Supernova MCP integration with AI coding tools (set up after documentation has meaningful content)
- Visual regression testing via Chromatic (add once the component set is stable and theming is proven)

---

## Expanding to Other Frameworks Later

When the time comes to add Vue, Svelte, or other framework support:

1. Create `packages/vue/` (or `packages/svelte/`, etc.)
2. Import from `schema`, `utils`, and `tokens` — all shared logic is already framework-agnostic
3. Build components using that framework's headless UI library equivalent
4. Apply styles using the same CSS custom properties — the token output is framework-agnostic
5. The component CSS files (`.css`) may be largely reusable across frameworks since they are plain CSS referencing CSS custom properties — only the component implementation (`.tsx` vs `.vue` vs `.svelte`) changes
6. Create a framework-specific build plugin (equivalent to `packages/react-vite`)
7. The theme config file works identically — the developer just imports a different component package

The shared packages do not change. The token output does not change. The Figma plugin does not change. The theme builder tool does not change. Only the component implementation layer is duplicated per framework.