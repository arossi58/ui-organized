# @ui-organized/utils

Pure utilities behind the **ui-organized** design system: perceptual color
generation, neutral presets, type-scale and spacing math, and semantic token
resolution. These functions power token generation and the theme builder.

## Install

```sh
npm install @ui-organized/utils
```

## Usage

```ts
import { resolveSemanticColors, generateTypeScale } from "@ui-organized/utils";
```

> Note: `coreColors` and `semanticColorMap` are generated from the token JSON;
> `resolveSemanticColors` is the single source of truth for semantic resolution.

## License

Apache-2.0
