# @ui-organized/react-vite

Vite plugin for the **ui-organized** design system. It builds the `theme.json`
you export from the [Theme Builder](https://uiorganized.com/tools/theme-builder)
into your app's CSS at bundle time, and checks the result defines every token the
components read. Editing `theme.json` during development updates the page in
place, without a reload.

## Install

```sh
npm install -D @ui-organized/react-vite
```

`vite` (>=5.1) is a peer dependency.

## Usage

Put the `theme.json` from your Theme Builder export in the project, then:

```ts
// vite.config.ts
import { themePlugin } from "@ui-organized/react-vite";

export default {
  plugins: [themePlugin({ config: "./theme.json" })],
};
```

Import the stylesheet once, at your app's entry. The import is what puts the
theme on the page; the plugin alone builds it but adds nothing:

```ts
// src/main.ts
import "virtual:@ui-organized/theme.css";
```

If you also load the token baseline (`@ui-organized/tokens/variables.css`),
import the theme after it: both declare the same tokens on `:root`, so the later
one wins. The theme is complete on its own, so the baseline is optional.

Nothing in the plugin is React-specific, so it works the same for the Svelte,
Vue and Angular libraries.

## What it does

- **Writes the builder's stylesheet.** The CSS is the same `theme.css` the Theme
  Builder exports for that theme: the default mode on `:root`, then
  `[data-theme="light"]` and `[data-theme="dark"]`, plus a
  `prefers-color-scheme` block when the default mode is `system`.
- **Reads the token values, not the builder's settings.** A `theme.json`
  re-exported from Figma with the Theme Import plugin keeps every variable a
  designer edited there, which loading it back into the builder would not.
- **Checks the token contract.** The build fails, naming each one, if the theme
  leaves out a token the installed library's components read. The list comes
  from the `@ui-organized/core` your library depends on.
- **Updates in place.** The theme is a CSS module, so in development an edit to
  `theme.json` swaps the stylesheet without reloading the page, and a broken
  edit shows Vite's error overlay until you fix it. In a build it lands in the
  bundle's CSS.

## Options

| Option        | Default          | What it sets                                                                                                                                                                   |
| ------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `config`      | `"./theme.json"` | Path to the theme.json, relative to Vite's `root`.                                                                                                                             |
| `defaultMode` | the theme's own  | `"light"`, `"dark"` or `"system"`: which mode lands on bare `:root`. Defaults to the Default mode set in the builder's export panel, which theme.json records, else `"light"`. |

## Without Vite

`themeJsonToCss` is the same conversion as a plain function, for a script or
another bundler:

```ts
import { readFileSync, writeFileSync } from "node:fs";
import { themeJsonToCss } from "@ui-organized/react-vite";

const theme = JSON.parse(readFileSync("theme.json", "utf-8"));
writeFileSync("src/styles/theme.css", themeJsonToCss(theme, { defaultMode: "system" }));
```

It doesn't check the token contract; the plugin does.

## Upgrading from 2.x

2.x read a different config format (`metadata`, `color.modes`, 16-step ramps)
through `@ui-organized/schema`, and its output had fallen behind the components.
3.0 reads only the Theme Builder's `theme.json`.

- **Your config file.** Recreate the theme in the
  [Theme Builder](https://uiorganized.com/tools/theme-builder), export it, and
  point `config` at the `theme.json` from the zip. A 2.x config fails the build
  with a message saying so.
- **The import.** Change `import "virtual:@ui-organized/theme"` to
  `import "virtual:@ui-organized/theme.css"`. The old specifier still works (it
  imports the stylesheet now), but it no longer has a default export.
- **`ds-theme.css` is gone.** The theme is part of your bundle's CSS instead of a
  separate file in the build output.

## When to reach for this

This is one of three ways to theme the system:

- **A `theme.css` from the [Theme Builder](https://uiorganized.com/tools/theme-builder)**:
  no build step, no config. What most projects want.
- **Hand-written CSS overrides**: redefine the custom properties you care about.
- **This plugin**: when `theme.json`, not the CSS, is what you version, for
  example because the same file also drives Figma.

Full comparison: <https://uiorganized.com/docs/theming>.

## License

Apache-2.0
