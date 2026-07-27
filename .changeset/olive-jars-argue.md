---
"@ui-organized/react": patch
---

Fix: icon registration was tree-shaken out of every production build.

`5.0.0` moved each icon library behind a subpath that registers itself by side effect:

```ts
import "@ui-organized/react/icons/lucide"; // registerIconSet(lucideIcons)
```

…while `package.json` declared `sideEffects: ["**/*.css"]`, which tells every bundler the JS in this package is pure. A side-effect-only import of a module the bundler believes is pure is exactly what tree shaking deletes, so the registration never ran and `<Icon>` rendered nothing — **in production builds only**. `vite dev` doesn't tree-shake, so development looked correct, and the build was green with no warning.

Measured on a real app: 0 `<svg>` after `vite build`, 8 of 8 after the fix.

`sideEffects` now exempts the icon modules, and stays narrow everywhere else so unused components still drop out:

```jsonc
"sideEffects": ["**/*.css", "./dist/icons/*.mjs", "./dist/icons/*.js"]
```

**The `<Icon>` warning now fires in production too.** It was dev-only, on the reasoning that a production problem should surface in development first. That reasoning failed in the one case that mattered: the bug existed *only* in production, so the sole diagnostic was suppressed exactly where it was needed. Production now gets one short actionable line; the detailed guidance stays in development, and now mentions tree-shaking as a cause when icons work in dev but not in a build.

**New release gate:** `examples/icon-smoke` is a minimal app using the documented setup and nothing else. The gate builds it for production, executes the built bundle under jsdom, and counts the `<svg>` elements it actually renders. Nothing cheaper works — unit tests import the module by name, which defeats tree shaking; `vite dev` never reproduces it; and grepping the bundle proves nothing because production output is minified. It builds its own dependency closure and needs no browser binaries, so it runs anywhere. In CI and in `pnpm release`.
