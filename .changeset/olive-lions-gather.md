---
"@ui-organized/core": minor
"@ui-organized/react": minor
---

New package: `@ui-organized/core`, the framework-neutral foundation the Svelte, Vue and Angular libraries will share with React.

Most of this design system was never React. The component stylesheets are plain global CSS with BEM class names and `var(--token)` values, and every state style keys off the `data-*` attributes the headless layer emits — `[data-state]`, `[data-highlighted]`, `[data-disabled]`, `[data-invalid]` — which Zag emits identically in every framework it supports. The variant recipes are `cva` maps: pure functions from props to a class string. Between them that is roughly three quarters of the source, and none of it could be reached without depending on `@ui-organized/react`.

So it moved: 66 stylesheets, 54 variant recipes, the control-size tables, Calendar's date arithmetic, Pagination's page-window algorithm, `OMIT_ARIA`/`popupControls`, and the tooling that derives the token contract from the CSS.

**Nothing about the React package's public API changed.** The same 352 exports, the same props, the same rendered markup, and `@ui-organized/react/styles` still resolves to a stylesheet whose rules are byte-identical to the one 5.0.1 shipped. `@ui-organized/react/token-contract.json` still exists and still lists the same 136 tokens, because `@ui-organized/cli` reads that file out of an installed package at runtime.

Two visible differences, neither of which should reach a consumer:

- `class-variance-authority` is no longer a dependency of `@ui-organized/react` — the recipes that called it live in core now — and the ESM bundle is ~15% smaller as a result.
- The `/* … */` source-path comments esbuild writes into `dist/index.css` now name the core package. The CSS rules either side of them are unchanged.

Consumers who want the stylesheet without the React package can now take `@ui-organized/core/styles.css`, or one component at a time via `@ui-organized/core/components/Button/Button.css`.
