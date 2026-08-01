# @ui-organized/tokens

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
