# @ui-organized/cli

## 0.2.0

### Minor Changes

- 92af28d: New package: `@ui-organized/cli`, a `uiorg` command for applying a theme bundle.

  ```sh
  npx @ui-organized/cli theme ~/Downloads/my-theme.zip
  ```

  The copying isn't the point — that's `unzip && cp`. The point is validating at the moment you apply, which only the design system can do because it's the only thing that knows its own contract. Four things that were previously silent now get reported before anything lands on disk:
  - **Token coverage** — diffed against `token-contract.json` from your installed `@ui-organized/react`, which is generated from the component CSS and so can't drift. A theme missing a property blocks the apply and names every one.
  - **Fonts named but not loadable** — `theme.css` copied and `fonts.ts` forgotten. The head keeps loading the previous theme's typefaces while the new metrics apply over them, which reads as a deliberate choice.
  - **Weights the family doesn't ship** — fetches each `css2` URL and diffs the returned `@font-face` rules. The endpoint answers `200` and omits the face, so a status check proves nothing.
  - **Cascade conflicts** — a `--type-font-*` declaration in your own CSS that will silently beat the theme.

  It also strips the uncompilable `import { IconProvider }` from an `icons.ts` produced by an older Theme Builder.

  `--dry-run` writes nothing and reports identically. Running it twice is a no-op. It refuses to overwrite when the working tree is dirty, detects where your `theme.css` already lives rather than assuming a layout, and reads your lockfile so the commands it suggests use your package manager. Zero dependencies — the zip reader is built on Node's `zlib`, so `npx` has nothing to download first and it behaves the same on Windows.
