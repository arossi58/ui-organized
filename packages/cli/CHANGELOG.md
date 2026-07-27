# @ui-organized/cli

## 0.2.1

### Patch Changes

- 0a1409d: Fix: the CLI did nothing when installed. `0.2.0` produced no output and exit 0 for every invocation, including `--help`, when run the way its own README documents.

  The entry point was guarded so that importing the module (which the tests do) wouldn't execute the CLI:

  ```js
  if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) void main();
  ```

  npm and npx install bins as symlinks. Node resolves an ES module's `import.meta.url` through the _real_ path while `process.argv[1]` holds the _symlink_ path, so the guard was never true and `main()` never ran. Nothing threw, so it read as a usage error on the caller's side rather than a broken tool.

  The guard only existed to reconcile one module doing two jobs, so the fix is to stop merging them: `dist/cli.js` is the bin and calls `main()` unconditionally; `dist/index.js` is the library and never self-executes. `@ui-organized/export` was already shaped this way.

  Also:
  - **No arguments now prints usage and exits 2.** It previously exited 0, which made a completely broken CLI indistinguishable from a working one — and is a large part of why this took so long to identify.
  - **`--version` reports the real version.** It was a hardcoded literal that drifted: `0.2.0` shipped reporting `0.1.0`. It now reads `package.json`.
  - **A smoke test packs the tarball, installs it, and runs the bin through the symlink**, asserting on output rather than exit codes. No unit test could have caught the original bug — calling `main()` from a test bypasses the entry point, which is where the bug was. It runs in CI and in `pnpm release`, so a manual publish is gated too. It builds the package itself rather than relying on something else having done so, and refuses to run against an unbuilt `dist/` with one clear message instead of a cascade of misleading failures.

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
