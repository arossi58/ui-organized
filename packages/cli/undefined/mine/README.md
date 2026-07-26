# Kitchen Sink Teal

Exported from the UI Organized Theme Builder. This bundle is one source of truth
in three consumable shapes.

## Files

- **theme.json** — DTCG design tokens (the canonical config). `primitive.color`
  holds the full ramps of every color family this theme uses; `color.light` /
  `color.dark` are the semantic tokens, each **referencing** a primitive
  (`{primitive.color.…}`) or carrying a raw literal. Typography, spacing, radius,
  dimension and component aliases are theme-independent. Icon settings live under
  `$extensions["com.ui-organized.theme-builder"].icons`.
- **theme.css** — derived web stylesheet (CSS custom properties for both modes).
  Use this if you just want to drop the theme into a web app.
- **icons.ts** — `IconProvider` config. Icons are React context, not a CSS or
  Figma variable, so they are applied in code rather than through the tokens.
- **fonts.ts** — the typefaces this theme names, with the stylesheet URL that
  loads each one. `theme.css` can name a font but cannot efficiently fetch it,
  so loading is left to your document head.

## Use in code (web)

Install the library, then import the stylesheets **in this order** at your app
entry:

```ts
// src/main.tsx
import '@ui-organized/react/styles'   // 1. component styles
import './styles/theme.css'           // 2. this export — after, so it wins
import './index.css'                  // 3. your own layout, last
```

Order is load-bearing. `theme.css` and any baseline token stylesheet both
declare on `:root`, and `:root` vs `:root` is a specificity tie — decided by
source order. Import the theme earlier and the baseline silently wins.

This file is self-contained: it carries the resolved colors *and* the
theme-independent constants (`--dimension-*`, `--z-index-*`) the component
styles need, so `@ui-organized/tokens/variables.css` is optional. Add it *before*
`theme.css` if you also want the raw primitive ramps to reference directly.

### Modes

`:root` is **light** — that is what a page renders as before any `data-theme` is set. Switch by attribute — no re-import:

```ts
document.documentElement.setAttribute('data-theme', 'light')  // or 'dark'
```

Pin the default in your HTML so the first frame paints correctly, before any
JavaScript runs:

```html
<html lang="en" data-theme="light">
```

Setting `data-theme` is a DOM mutation, so nothing re-renders on its own. Code
that reads resolved token values needs a `MutationObserver` on the attribute.

## Use the fonts (web)

This theme is set in **Oswald** and **Inter**. **`theme.css` names those families but does
not load them** — add these to your document `<head>`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&display=swap">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap">
```

Without them the theme's metrics — sizes, weights and leading — render in
whatever fallback the browser picks. It looks deliberate, which is exactly why
it's easy to miss.

The tags are deliberately *not* an `@import` inside `theme.css`. An `@import` is
invisible to the browser's preload scanner, so the font would sit behind a second
round trip, and it would hard-code a CDN into your tokens — which makes
self-hosting a matter of editing generated output after every re-export.
`fonts.ts` carries the same list as data if you'd rather generate the tags at
build time, or self-host the files and ignore these entirely.

> **Watch the cascade:** any `--type-font-*` declaration in a stylesheet imported
> *after* `theme.css` silently overrides these families. Loading the font does not
> fix that — check your import order first if the typeface still looks wrong.

## Use the icons (code)

The icon libraries are *optional* peer dependencies: `@ui-organized/react`
imports none of them itself, so you install the one you chose and register it.
That is what keeps the other two out of your install and your bundle.

```sh
npm i lucide-react
```

```tsx
import '@ui-organized/react/icons/lucide'   // registers the icon set
import { IconProvider } from '@ui-organized/react'
import { iconConfig } from './icons'

<IconProvider {...iconConfig}>
  <App />
</IconProvider>
```

Both lines are required. Without the subpath import `<Icon>` renders nothing and
logs how to fix it; without the package installed the import itself fails.

## Use in Figma

Import **theme.json** with the **UI Organized - Theme Import** plugin. It creates
(or updates) four variable collections:

- **Primitives** — the used global colors from `primitive.color`.
- **Semantic** — `color.light` / `color.dark` as the collection's Light/Dark
  modes; each color is a Figma **alias** pointing at a Primitive, so re-skinning
  the brand/neutral re-flows everything.
- **Scale** — spacing, radius, fixed dimensions and component dimensions,
  including the shared `control-height` (sm/md/lg) that keeps buttons, inputs and
  selects aligned.
- **Typography** — font families, weights, sizes and line-heights.
- **Icons** — only when dynamic stroke scaling is on: each icon size with its
  optically-corrected stroke weight (Figma can't compute strokes the way the
  `<Icon>` component does at runtime, so the plugin materialises them).

Re-running the import overwrites existing variables in place and adds new ones.
Icon library/style settings are otherwise metadata — apply them in code via
`icons.ts`.
