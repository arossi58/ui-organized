---
"@ui-organized/react-vite": major
---

The plugin now builds the `theme.json` you export from the Theme Builder. 2.x read an older theme config format that the builder never wrote, so a real `theme.json` failed validation, and the 2.x output was missing tokens the components read, with every `--Button-*` token set to `transparent`. The CSS it writes now is the same `theme.css` the builder exports for that theme. Because it reads the token values rather than the builder's settings, a `theme.json` re-exported from Figma keeps every variable a designer edited there.

The build now fails if the theme leaves out a token the components read, and the error names each missing token. The list comes from the token contract of the library you have installed.

Editing `theme.json` during development now updates the page in place. 2.x reloaded the whole page. The theme is a real CSS module now, so a build includes it in your bundle's CSS.

To upgrade:

- **Config.** Point `themePlugin({ config })` at the `theme.json` from a Theme Builder export. A 2.x config now fails the build, and the error links to the Theme Builder. `config` defaults to `./theme.json`, and the new `defaultMode` option overrides the default mode saved in the theme.
- **Import.** Change `import "virtual:@ui-organized/theme"` to `import "virtual:@ui-organized/theme.css"`. The old specifier still works, but it no longer has a default export.
- **`ds-theme.css`.** The build no longer emits it as a separate file. The theme is in your bundle's CSS.
- **Vite.** The peer range is now `>=5.1`.

`themeJsonToCss(theme, { defaultMode })` does the same conversion as a plain function, for scripts and other bundlers. The plugin no longer depends on `@ui-organized/schema`.
