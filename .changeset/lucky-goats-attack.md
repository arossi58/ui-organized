---
"@ui-organized/tokens": minor
"@ui-organized/react": minor
"@ui-organized/export": minor
---

Fix theming setup: a generated theme is now complete by construction, and the library degrades gracefully when one isn't.

**`@ui-organized/react`**

- `@ui-organized/react/styles.css` now resolves. It was never an exports subpath, so the spelling most people type — and the one the Theme Builder's own instructions shipped — failed the build on the first line. Both `/styles` and `/styles.css` are exported, and both carry TypeScript types, so consumers no longer need a `declare module` shim.
- Component styles reference the non-themeable layout constants with fallbacks (`var(--z-index-popover, 1000)`, `var(--dimension-06, 240px)`). A theme that omits them used to fail silently — green build, clean console, sidebar shrunk to fit its content and every portalled overlay stacking on DOM order alone.
- Ships `token-contract.json`, importable as `@ui-organized/react/token-contract.json`: the generated list of all 122 custom properties the components consume but don't define. Derived from the component CSS, so it can't drift from the library — use it to check a theme is complete.

**`@ui-organized/tokens`**

- New typed exports `dimensionTokens`, `zIndexTokens` and `globalConstantVars()`. The z-index scale used to be a string literal appended to `variables.css` after the build, which made it unimportable — and that is precisely why theme generators dropped it. It is now a DTCG source file like every other token.

**`@ui-organized/export`**

- `exportCss` backfills the layout constants for any document that doesn't define them. A document that does keeps its own values.
