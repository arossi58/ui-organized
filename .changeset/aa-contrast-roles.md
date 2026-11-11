---
"@ui-organized/utils": major
"@ui-organized/tokens": minor
"@ui-organized/core": minor
"@ui-organized/react": minor
"@ui-organized/svelte": minor
"@ui-organized/vue": minor
"@ui-organized/angular": minor
---

**Semantic colour roles now hold WCAG AA for every brand × neutral × mode.** Colour values move in this release **because the old ones failed AA**. If you colour-matched against the previous output, expect differences in the places listed below.

A new regression test resolves all 572 combinations (26 brands × 11 neutrals × 2 modes) and checks each text, link, button-label and focus pair against its WCAG floor. `pnpm audit:contrast` prints the same audit.

**`@ui-organized/utils`**

- `getCoreFamily(name)` now returns the **derived** ramp for neutral families, re-lightened to match grey step for step. The authored tinted neutrals differ from grey by up to 23 L* mid-ramp, and 19 of 33 dark-mode text pairs failed on them. The authored ramps are still available through the new `getAuthoredFamily(name)`, for palette display.
- `resolveSemanticColors` / `resolveSemanticRefs` choose three roles by contrast instead of using a fixed step:
  - `--color-interactive-contents` (the filled-button label) is near-black on light brand fills. 13 of 26 brands, including candlelight at 1.99:1, used to get a white label.
  - Primary fill states walk the ramp away from the label when they would fail with it.
  - Link states (`--color-interactive-tertiary-{default,hover,active}`) walk the ramp until they clear 4.5:1 on both surfaces, and stay on distinct steps.
- An unresolvable ref now **throws** instead of being written into CSS as `"grey.2400"`. `getNeutralPreset()` ramps are 16-step pack presets and are not valid input to the resolver.
- New exports: `getAuthoredFamily`, `contrastRatio`, `relativeLuminance`, and `pickPrimaryLabel` (the label the resolver puts on a given primary fill, for shade pickers). Both theme builders now judge primary shades by that label, so light brands keep their own 1400 with a dark label instead of being forced to a dark shade.

**`@ui-organized/tokens`**

- Default theme: `--color-interactive-primary-active` → `brand.1500` in both modes (the label on the pressed fill was 4.15:1). Light `--color-interactive-tertiary-active` → `brand.1700`. Dark `--color-interactive-tertiary-hover` → `brand.1200` (it was 2.35:1, darker than the page) and dark `-active` → `brand.1000`.
- `initTheme()` no longer writes to storage on load, and it follows the OS until an explicit `setTheme` or `toggleTheme`. `setTheme("system")` returns to following the OS. A browser reporting `no-preference` now resolves to **light** (it used to resolve to dark). The fallback can be set with `initTheme({ fallback })` or positionally as before.
- Overlay tokens (`--color-interactive-ui-*`, `-secondary-*`, `-ghost-*`) document their alpha at the point of definition and in the README.

**Components**

- Focus rings are drawn with `outline`, not `box-shadow`, in every component. A consumer `box-shadow` no longer erases the focus indicator, and the ring now shows in forced-colors mode.
- Button hover and press rules are wrapped in `:where()`, so one consumer class restyles every state.
- New icons for theme toggles: `sun`, `moon` and `monitor`.
