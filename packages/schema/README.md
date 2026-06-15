# @ui-organized/schema

[Zod](https://zod.dev/) schemas and TypeScript types for the **ui-organized**
design system theme configuration. This is the single source of truth that the
token pipeline and the Vite plugin validate against.

## Install

```sh
npm install @ui-organized/schema
```

## Usage

```ts
import { validateConfig } from "@ui-organized/schema";

const config = validateConfig(JSON.parse(rawThemeJson));
//    ^ fully typed ThemeConfig, throws on invalid input
```

## License

Apache-2.0
