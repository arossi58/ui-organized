# @ui-organized/react-vite

Vite plugin for the **ui-organized** design system. It reads a theme config
JSON file, validates it against [`@ui-organized/schema`](https://www.npmjs.com/package/@ui-organized/schema),
runs the token pipeline, and injects the resulting CSS custom properties into
your build — both at build time and during the dev server with HMR.

## Install

```sh
npm install -D @ui-organized/react-vite
```

`vite` (>=5) is a peer dependency.

## Usage

```ts
// vite.config.ts
import { themePlugin } from "@ui-organized/react-vite";

export default {
  plugins: [
    themePlugin({ config: "./theme.json" }),
  ],
};
```

The generated tokens are exposed via the virtual module
`virtual:@ui-organized/theme` and emitted as `ds-theme.css` in the build output.
Editing `theme.json` during development triggers a token rebuild and reload.

## When to reach for this

This is one of three ways to theme the system, and the least common:

- **A `theme.css` from the [Theme Builder](https://uiorganized.com/tools)** — no
  build step, no config. What most projects want.
- **Hand-written CSS overrides** — redefine the custom properties you care about.
- **This plugin** — when the *config* is the artifact you version and the CSS is
  a build output, e.g. when the same `theme.json` also drives Figma.

Full comparison: <https://uiorganized.com/docs/theming>.

## License

Apache-2.0
