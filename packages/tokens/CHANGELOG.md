# @ui-organized/tokens

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
