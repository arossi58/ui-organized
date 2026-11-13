# @ui-organized/tokens

Design tokens for the **ui-organized** design system. Ships both typed
JavaScript/TypeScript exports and a generated CSS custom-properties file,
built from DTCG source tokens with [Style Dictionary](https://styledictionary.com/).

## Install

```sh
npm install @ui-organized/tokens
```

## Usage

Import the generated CSS variables once at your app root:

```ts
import "@ui-organized/tokens/variables.css";
```

This is the baseline. Import it *before* any theme of your own — both declare on
`:root`, and that tie is decided by source order.

## The layers

| Layer | Example | Notes |
| --- | --- | --- |
| Primitive | `--grey-1400`, `--brand-1600` | The raw OKLCH ramps. Components never reference these. |
| Semantic | `--color-surface-primary` | The roles components speak in. Assigned per mode. |
| Component | `--radius-interactive`, `--control-height-md` | Shared decisions, aliased onto the scales. |
| Constant | `--dimension-06`, `--z-index-popover` | Theme-independent layout values. |

The constants are the ones worth knowing about: no theme has a reason to change
them, but component CSS reads them — `--dimension-06` is the sidebar's width, and
the `--z-index-*` scale is the whole portalled-overlay stack. A generated theme
that omits them fails silently, so they ship as typed values for any tool that
produces a stylesheet:

```ts
import { dimensionTokens, zIndexTokens, globalConstantVars } from "@ui-organized/tokens";

globalConstantVars();
// → { "--dimension-01": "40px", …, "--z-index-toast": "1400" }
```

Other typed exports: `typeSizeTokens`, `typeLeadingTokens`, `typeFontTokens`,
`typeWeightTokens`.

**Deprecated:** `transformConfig`, `buildCss`, `semanticColorTokens` and
`componentTokens`. They're the old theme-config pipeline, which predates the
token contract: its semantic names are retired and its output misses tokens the
components read. Nothing in the system uses them since
`@ui-organized/react-vite` 3, and they're removed in the next major. To build a
theme stylesheet, export one from the
[Theme Builder](https://uiorganized.com/tools/theme-builder), or build its
`theme.json` with [`@ui-organized/react-vite`](https://www.npmjs.com/package/@ui-organized/react-vite).

To regenerate `output/variables.css` from the DTCG source files:

```sh
pnpm build:tokens
```

### Overlay tokens are not fills

These tokens are translucent. They're meant to be layered over a surface, not
used as a surface themselves:

| Tokens | Dark | Light |
| --- | --- | --- |
| `--color-interactive-ui-{default,hover,active,selected}` | near-white at 2 / 6 / 10 / 14% | near-black at 2 / 6 / 10 / 14% |
| `--color-interactive-secondary-{default,hover,active,selected}` | white at 10 / 20 / 15 / 15% | black at 10 / 20 / 15 / 15% |
| `--color-interactive-ghost-{default,hover,active}` | transparent / white 20% / 15% | transparent / black 20% / 15% |
| `--color-surface-overlay-{primary,secondary,tertiary}` | 6 / 10 / 14% | 6 / 10 / 14% |

Used as the only background, an element reads as transparent. Put it on
something that already sits on `--color-surface-*`.

## Runtime theme

```ts
import { initTheme, setTheme, toggleTheme } from "@ui-organized/tokens";

initTheme();          // stored choice, else follow the OS (no-preference → light)
toggleTheme();        // explicit choice, remembered
setTheme("system");   // forget the choice, follow the OS again
```

`initTheme()` never writes to storage. Only an explicit `setTheme`/`toggleTheme`
does, so a visitor who never picks keeps following their OS.

**The baseline `:root` is dark-first.** With no `data-theme` on `<html>`, or an
unknown one, the page paints dark. If you server-render a light default, put
`data-theme="light"` in the markup yourself. Don't wait for script to set it.

Theming guide: <https://uiorganized.com/docs/theming>.

## License

Apache-2.0
