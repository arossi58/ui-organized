# @ui-organized/core

The framework-neutral foundation shared by every ui-organized component library.

This package holds the parts of the design system that have nothing to do with
any one framework:

- **Component stylesheets** — plain global CSS, BEM class names, every value a
  `var(--token)` reference. State is styled off the `data-*` attributes the
  headless layer emits (`[data-state]`, `[data-highlighted]`, `[data-disabled]`,
  `[data-invalid]`), which is what lets one stylesheet serve React, Svelte, Vue
  and Angular.
- **Variant recipes** — the `cva` maps that turn a component's props into class
  names. Pure functions returning strings; no framework involved.
- **Pure helpers** — OKLCH colour maths, date arithmetic, the pagination
  page-window algorithm, control sizing tables.

## Consuming it

Framework packages import stylesheets one component at a time, so a consumer who
uses three components does not ship all sixty-five:

```ts
import "@ui-organized/core/components/Button/Button.css";
```

Consumers who want the whole stylesheet at once — Angular's global styles, say —
take the bundle:

```ts
import "@ui-organized/core/styles.css";
```

Either way it goes **after** the token baseline and **before** any local theme:

```ts
import "@ui-organized/tokens/variables.css";
import "@ui-organized/core/styles.css";
import "./theme.css";
```

## What must never end up here

Anything that imports a framework, touches the DOM, or assumes a renderer. If a
helper needs `document`, it belongs in the framework package that uses it.
