---
"@ui-organized/cli": minor
---

`uiorg theme` now sets up the library your project uses, not just React. It reads which one from package.json, or takes `--framework react|svelte|vue|angular`, and the steps it prints at the end follow that library's Get started page: the `@ui-organized/tokens` baseline first, then the library's own stylesheet (`styles.css` for Svelte and Vue), and in an Angular CLI project the `angular.json` `"styles"` list instead of imports. It names the right icon package for the library, pinned to `@34` for `@ng-icons` on Angular 21, and skips install commands for packages you already list.

`icons.ts` is React's `IconProvider` config and failed to compile anywhere else, so it's now only written in a React project. Svelte, Vue and Angular get their own provider printed with the theme's icon settings instead (Vue's `icon-style`, Angular's `provideIconConfig`). React gets the `<IconProvider {...iconConfig}>` step that was missing, so the `icons.ts` it writes is actually used. A theme that picks Heroicons warns on Svelte, which has no Heroicons adapter.

Token coverage is checked for all four libraries. The contract now comes from `@ui-organized/core` through your installed library, so it works with pnpm and with a library hoisted to a monorepo root; React 5.x still uses its own copy. At a monorepo root that declares no library, the CLI names the package to pass to `--cwd`.

Only a check that ran and passed shows `✓`. "Token coverage not checked" is a warning (`!`), and context such as an unreachable Google Fonts shows as `·`. With `--force`, a blocking finding now prints "Applying anyway (--force)" instead of "Not applied" before applying, and the exit code is still 1. The import-order note names the real tie: `theme.css` and `@ui-organized/tokens/variables.css` both declare on `:root`.

`uiorg init` pins `@ui-organized/mcp@0.1.0` for a 6.0.x library. The server's own 6.0.0 was never published, so the pin it wrote before couldn't install; 0.1.0 was built from 6.0.0 and carries its data. 6.1.0 and later pin their own version, as before.

Re-running `init` keeps what you added to the `ui-organized` entry in `.mcp.json`, such as `env`, and keeps the file's indentation. A file that already says what init would write is left alone and reported unchanged. The `ui-organized-figma` skill and the Cursor rules, which init owns whole, are reported as "replaced" when they had changed. A rules file whose end marker was deleted no longer loses the text after it on the next run, and `init --cwd` without a directory now says so.
