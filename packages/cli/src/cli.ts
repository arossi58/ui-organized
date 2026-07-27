#!/usr/bin/env node
import { main } from "./index.js";

/**
 * The `uiorg` bin. Nothing but a call.
 *
 * This file exists because the previous arrangement — one module that was both
 * the bin and the library, with an `import.meta.url === pathToFileURL(argv[1])`
 * guard to tell the two apart — shipped a CLI that did nothing at all.
 *
 * npm and npx install bins as symlinks:
 *
 *     node_modules/.bin/uiorg -> ../@ui-organized/cli/dist/index.js
 *
 * Node resolves an ES module's `import.meta.url` through the *real* path, while
 * `process.argv[1]` holds the *symlink* path. They never match, so the guard was
 * always false and `main()` never ran. No error, no output, exit 0 — which reads
 * as the caller's mistake rather than a broken tool.
 *
 * The guard only existed to reconcile the two roles, so the fix is to stop
 * merging them. A bin that calls `main()` unconditionally has nothing to get
 * wrong, and `index.js` can export `run`/`main` for tests without ever executing.
 * `@ui-organized/export` was already shaped this way; this restores the
 * convention.
 */
void main();
