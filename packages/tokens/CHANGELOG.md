# @ui-organized/tokens

## 3.5.0

### Minor Changes

- e6613d2: **Semantic colour roles now hold WCAG AA for every brand × neutral × mode.** Colour values move in this release **because the old ones failed AA**. If you colour-matched against the previous output, expect differences in the places listed below.

  A new regression test resolves all 572 combinations (26 brands × 11 neutrals × 2 modes) and checks each text, link, button-label and focus pair against its WCAG floor. `pnpm audit:contrast` prints the same audit.

  **`@ui-organized/utils`**
  - `getCoreFamily(name)` now returns the **derived** ramp for neutral families, re-lightened to match grey step for step. The authored tinted neutrals differ from grey by up to 23 L\* mid-ramp, and 19 of 33 dark-mode text pairs failed on them. The authored ramps are still available through the new `getAuthoredFamily(name)`, for palette display.
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

- **Dark mode: the primary and secondary surfaces trade places, and so do the primary and secondary borders.** Light mode is unchanged.

  | Token                       | Was         | Now         |
  | --------------------------- | ----------- | ----------- |
  | `--color-surface-primary`   | `grey.2300` | `grey.2200` |
  | `--color-surface-secondary` | `grey.2200` | `grey.2300` |
  | `--color-border-primary`    | `grey.2100` | `grey.2000` |
  | `--color-border-secondary`  | `grey.2000` | `grey.2100` |

  Dark mode had both pairs the opposite way round from light. In light mode the primary surface is the one furthest from the page, with secondary between them, and the primary border is the stronger hairline. Dark mode now orders them the same way, so a card on `--color-surface-primary` lifts off the page in both modes, and a layout that relies on the difference reads the same after a theme switch. The `semanticColorMap` in `@ui-organized/utils` carries the same change, so themes resolved through `resolveSemanticColors` follow it.

### Patch Changes

- Updated dependencies [e6613d2]
- Updated dependencies
- Updated dependencies [83201b5]
  - @ui-organized/utils@4.0.0

## 3.4.0

### Minor Changes

- eea54c1: Fix: every popper-positioned overlay computed `z-index: auto`. The whole `--z-index-*` scale was dead code for seven components, and a dropdown opened inside a `<Dialog>` rendered behind it.

  `@zag-js/popper` owns the positioner's stacking. It writes an inline `z-index: var(--z-index)` onto the positioner, then fills that variable by reading the popup:

  ```js
  // @zag-js/popper — get-placement.mjs
  floating.style.setProperty("--z-index", getComputedStyle(contentEl).zIndex);
  ```

  So the contract is _style the popup, the positioner inherits_. This package styled the positioner:

  ```css
  .select-positioner {
    z-index: var(--z-index-popover, 1000);
  } /* never applied */
  ```

  zag read `.select-popup`, which declared no `z-index`, hoisted `auto`, and its own inline style outranked the stylesheet rule. Nothing threw and the rule was right there in devtools — the only symptom was an overlay losing to a dialog. zag latches the read after the first open, so it never self-corrects on a later render either.

  The declaration moved to the popup in all eight affected components: `Select`, `Combobox`, `Menu`, `ContextMenu`, `Popover`, `HoverCard`, `Tooltip` and the date pickers' popover. `Dialog`, `Sheet` and `Toast` were never popper-positioned and were already correct — which is exactly why a dropdown-in-a-dialog was the case that surfaced this.

  **The stacking scale is reordered: anchored surfaces now outrank modal ones.**

  | Token               | Was    | Now    |
  | ------------------- | ------ | ------ |
  | `--z-index-dialog`  | `1100` | `1100` |
  | `--z-index-popover` | `1000` | `1200` |
  | `--z-index-tooltip` | `1200` | `1300` |
  | `--z-index-toast`   | `1300` | `1400` |

  Ranking popovers _below_ dialogs never described a real arrangement. An anchored surface is always spawned from something, and that something is often a dialog, so it has to paint over its own host. The previous order only looked correct because the values were inert.

  **If you layer your own overlays against these tokens, re-check them** — a fixed header at `1150` that used to clear every menu no longer does. Reference the tokens rather than the literals; both packages export the scale (`zIndexTokens`, `globalConstantVars()`).

  **If you patched this in app CSS**, the `!important` block on `[data-scope]` positioners was the only lever available — no component exposes a `zIndex` prop, and these elements portal to `document.body`, so there is no ancestor to scope to. It can be deleted. Leaving it in place is harmless; it just wins redundantly.

  **New regression gate:** `overlayStacking.test.ts` derives the popper-backed positioners from the rendered TSX and fails if any of them declares `z-index`, if any popup omits it, or if the tier order stops putting anchored surfaces above modal ones. A new anchored component has to be declared in it rather than silently inheriting the bug. The token-contract deriver now strips CSS comments too — prose that quotes `var(--z-index)` was otherwise entering the contract as a token every theme had to ship.

## 3.3.0

### Minor Changes

- 7b759c8: Fix theming setup: a generated theme is now complete by construction, and the library degrades gracefully when one isn't.

  **`@ui-organized/react`**
  - `@ui-organized/react/styles.css` now resolves. It was never an exports subpath, so the spelling most people type — and the one the Theme Builder's own instructions shipped — failed the build on the first line. Both `/styles` and `/styles.css` are exported, and both carry TypeScript types, so consumers no longer need a `declare module` shim.
  - Component styles reference the non-themeable layout constants with fallbacks (`var(--z-index-popover, 1000)`, `var(--dimension-06, 240px)`). A theme that omits them used to fail silently — green build, clean console, sidebar shrunk to fit its content and every portalled overlay stacking on DOM order alone.
  - Ships `token-contract.json`, importable as `@ui-organized/react/token-contract.json`: the generated list of all 122 custom properties the components consume but don't define. Derived from the component CSS, so it can't drift from the library — use it to check a theme is complete.

  **`@ui-organized/tokens`**
  - New typed exports `dimensionTokens`, `zIndexTokens` and `globalConstantVars()`. The z-index scale used to be a string literal appended to `variables.css` after the build, which made it unimportable — and that is precisely why theme generators dropped it. It is now a DTCG source file like every other token.

  **`@ui-organized/export`**
  - `exportCss` backfills the layout constants for any document that doesn't define them. A document that does keeps its own values.

## 3.2.0

### Minor Changes

- b616cc8: Remove build-time and unused packages from the published runtime dependency tree.

  `style-dictionary` is a build-time-only tool and is now a devDependency of `@ui-organized/tokens`; it was previously installed by every consumer of `@ui-organized/react`. Also drops the unused `@ui-organized/schema` dependency from `@ui-organized/utils` and `@ui-organized/react`.

  No API changes. Consumer install drops from ~253 packages to ~96.

### Patch Changes

- Updated dependencies [b616cc8]
  - @ui-organized/utils@3.2.0

## 3.1.0

### Minor Changes

- 980ecf0: Styling updates

### Patch Changes

- 67687e1: Remap the semantic status colors (`success`, `info`, `info-secondary`, `caution`, `error`) to new primitive shades from the theme-builder export, in both the shipped token pipeline and the theme builder's resolver. Dark base now uses the `1700`/`2000`/`300` shade pattern and light uses `1500`/`600`/`2100`; `error-message` is unchanged. The `warning` (cerise) tokens are untouched.
- Updated dependencies [980ecf0]
- Updated dependencies [67687e1]
  - @ui-organized/schema@3.1.0
  - @ui-organized/utils@3.1.0

## 3.0.0

### Major Changes

- 7fa8db2: consolidated text and icon color tokens to content tokens

### Patch Changes

- Updated dependencies [7fa8db2]
  - @ui-organized/schema@3.0.0
  - @ui-organized/utils@3.0.0

## 2.1.0

### Minor Changes

- c7949c8: Code and design parity for additional components

### Patch Changes

- Updated dependencies [c7949c8]
  - @ui-organized/schema@2.1.0
  - @ui-organized/utils@2.1.0

## 2.0.0

### Major Changes

- Released as part of the unified ui-organized 2.0.0 line. Versions are aligned across the `@ui-organized/*` suite for the Ark UI migration; use matching 2.x versions of all `@ui-organized/*` packages together.

### Patch Changes

- Updated dependencies
  - @ui-organized/schema@2.0.0
  - @ui-organized/utils@2.0.0

## 0.1.1

### Patch Changes

- a6391a4: Theme builder fixes, default palette and palette updates, overview details, and Google Analytics integration.
- Updated dependencies [a6391a4]
  - @ui-organized/schema@0.1.1
  - @ui-organized/utils@0.1.1
