---
"@ui-organized/cli": patch
---

Fix: the CLI did nothing when installed. `0.2.0` produced no output and exit 0 for every invocation, including `--help`, when run the way its own README documents.

The entry point was guarded so that importing the module (which the tests do) wouldn't execute the CLI:

```js
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) void main()
```

npm and npx install bins as symlinks. Node resolves an ES module's `import.meta.url` through the *real* path while `process.argv[1]` holds the *symlink* path, so the guard was never true and `main()` never ran. Nothing threw, so it read as a usage error on the caller's side rather than a broken tool.

The guard only existed to reconcile one module doing two jobs, so the fix is to stop merging them: `dist/cli.js` is the bin and calls `main()` unconditionally; `dist/index.js` is the library and never self-executes. `@ui-organized/export` was already shaped this way.

Also:

- **No arguments now prints usage and exits 2.** It previously exited 0, which made a completely broken CLI indistinguishable from a working one — and is a large part of why this took so long to identify.
- **`--version` reports the real version.** It was a hardcoded literal that drifted: `0.2.0` shipped reporting `0.1.0`. It now reads `package.json`.
- **A smoke test packs the tarball, installs it, and runs the bin through the symlink**, asserting on output rather than exit codes. No unit test could have caught the original bug — calling `main()` from a test bypasses the entry point, which is where the bug was. It runs in CI and in `pnpm release`, so a manual publish is gated too.
