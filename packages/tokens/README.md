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

Or consume the typed token values and the build pipeline directly:

```ts
import { transformConfig, buildCss } from "@ui-organized/tokens";
```

To regenerate `output/variables.css` from the DTCG source files:

```sh
pnpm build:tokens
```

## License

Apache-2.0
