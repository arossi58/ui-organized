---
"@ui-organized/core": minor
"@ui-organized/react": minor
"@ui-organized/svelte": minor
"@ui-organized/vue": minor
"@ui-organized/angular": minor
---

FeaturedIcon: an icon in a tinted circle or square, in all four libraries (`UioFeaturedIcon` on a `<span>` in Angular). It is the anchor for empty states, dialog headers, feature grids and metric cards.

- `variant` is the colour: `brand`, `neutral`, `success`, `info`, `caution` or `error`.
- `appearance` is the treatment: `subtle` (a tint, the default), `solid` or `outline` (no fill, two faded rings).
- `shape` is `circle` or `square`, and `size` is `sm`, `md`, `lg` or `xl` (32 to 56 px, holding a 16 to 28 px icon).
- It is decorative by default. A `label` makes it an image with that name.

The brand colour adds no theme tokens, so a theme exported before this release keeps working and `@ui-organized/react-vite` has nothing new to ask for. Its tint is the brand fill at 12% over the surface, and its icon colour is that fill mixed halfway toward the primary text colour. That pair holds at least 6:1 for every brand colour the Theme Builder offers, in both modes.
