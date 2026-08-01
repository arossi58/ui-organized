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
`typeWeightTokens`, `semanticColorTokens`, `componentTokens`. Or consume the
build pipeline directly:

```ts
import { transformConfig, buildCss } from "@ui-organized/tokens";
```

To regenerate `output/variables.css` from the DTCG source files:

```sh
pnpm build:tokens
```

Theming guide: <https://uiorganized.com/docs/theming>.

## License

Apache-2.0
