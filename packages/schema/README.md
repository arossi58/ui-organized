# @ui-organized/schema

[Zod](https://zod.dev/) schemas and TypeScript types for **ui-organized** token
documents: DTCG 2025.10 tokens and groups, and the project document the token
tooling reads and writes.

## Install

```sh
npm install @ui-organized/schema
```

## Usage

```ts
import { DtcgDocumentSchema } from "@ui-organized/schema";

const result = DtcgDocumentSchema.safeParse(JSON.parse(rawTokensJson));
```

## Deprecated: the legacy theme config

`themeConfigSchema` and `validateConfig` describe the old theme config
(`metadata`, 16-step `resolvedPrimitives`, `color.modes`). Nothing reads that
format any more: the Theme Builder exports a DTCG `theme.json`, and
[`@ui-organized/react-vite`](https://www.npmjs.com/package/@ui-organized/react-vite)
3 builds that. A Theme Builder `theme.json` fails `validateConfig` by design.
Both are removed in the next major.

## License

Apache-2.0
