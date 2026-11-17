---
"@ui-organized/svelte": patch
"@ui-organized/vue": patch
"@ui-organized/svelte-table": patch
---

Svelte and Vue apps now ship only the component CSS they import. Each component brings its own stylesheet, and the package entry brings the typography and base rules every component relies on, so `@ui-organized/svelte/styles.css` and `@ui-organized/vue/styles.css` are optional: leave them out and a page with one Button carries the Button's styles, not every component's. Before, a Vue app got all sixty-six component stylesheets as soon as it imported anything, and in both libraries the typography classes the components set their text in had no rules unless you imported the whole sheet. Importing `/styles.css` still works exactly as before.

The Svelte `Button` accepts the same `class` values as any element (a string, an array, an object or `null`), as do `Chip`, `Tag`, `Card` and `Divider`. Projecting one of them through an Ark trigger's `asChild`, as in `<Button {...props()}>`, now type-checks without a cast.
