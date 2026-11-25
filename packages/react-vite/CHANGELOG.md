# @ui-organized/react-vite

## 3.0.0

### Major Changes

- abddf1f: The plugin now builds the `theme.json` you export from the Theme Builder. 2.x read an older theme config format that the builder never wrote, so a real `theme.json` failed validation, and the 2.x output was missing tokens the components read, with every `--Button-*` token set to `transparent`. The CSS it writes now is the same `theme.css` the builder exports for that theme. Because it reads the token values rather than the builder's settings, a `theme.json` re-exported from Figma keeps every variable a designer edited there.

  The build now fails if the theme leaves out a token the components read, and the error names each missing token. The list comes from the token contract of the library you have installed.

  Editing `theme.json` during development now updates the page in place. 2.x reloaded the whole page. The theme is a real CSS module now, so a build includes it in your bundle's CSS.

  To upgrade:
  - **Config.** Point `themePlugin({ config })` at the `theme.json` from a Theme Builder export. A 2.x config now fails the build, and the error links to the Theme Builder. `config` defaults to `./theme.json`, and the new `defaultMode` option overrides the default mode saved in the theme.
  - **Import.** Change `import "virtual:@ui-organized/theme"` to `import "virtual:@ui-organized/theme.css"`. The old specifier still works, but it no longer has a default export.
  - **`ds-theme.css`.** The build no longer emits it as a separate file. The theme is in your bundle's CSS.
  - **Vite.** The peer range is now `>=5.1`.

  `themeJsonToCss(theme, { defaultMode })` does the same conversion as a plain function, for scripts and other bundlers. The plugin no longer depends on `@ui-organized/schema`.

### Patch Changes

- Updated dependencies [d77dcaa]
- Updated dependencies [abddf1f]
  - @ui-organized/tokens@3.5.1

## 2.2.4

### Patch Changes

- Updated dependencies [e6613d2]
- Updated dependencies
  - @ui-organized/tokens@3.5.0

## 2.2.3

### Patch Changes

- Updated dependencies [eea54c1]
  - @ui-organized/tokens@3.4.0

## 2.2.2

### Patch Changes

- Updated dependencies [7b759c8]
  - @ui-organized/tokens@3.3.0

## 2.2.1

### Patch Changes

- Updated dependencies [b616cc8]
  - @ui-organized/tokens@3.2.0

## 2.2.0

### Minor Changes

- 980ecf0: Styling updates

### Patch Changes

- Updated dependencies [980ecf0]
- Updated dependencies [67687e1]
  - @ui-organized/schema@3.1.0
  - @ui-organized/tokens@3.1.0

## 2.1.1

### Patch Changes

- Updated dependencies [7fa8db2]
  - @ui-organized/schema@3.0.0
  - @ui-organized/tokens@3.0.0

## 2.1.0

### Minor Changes

- c7949c8: Code and design parity for additional components

### Patch Changes

- Updated dependencies [c7949c8]
  - @ui-organized/schema@2.1.0
  - @ui-organized/tokens@2.1.0

## 2.0.0

### Major Changes

- Released as part of the unified ui-organized 2.0.0 line. Versions are aligned across the `@ui-organized/*` suite for the Ark UI migration; use matching 2.x versions of all `@ui-organized/*` packages together.

### Patch Changes

- Updated dependencies
  - @ui-organized/schema@2.0.0
  - @ui-organized/tokens@2.0.0

## 0.1.1

### Patch Changes

- Updated dependencies [a6391a4]
  - @ui-organized/schema@0.1.1
  - @ui-organized/tokens@0.1.1
