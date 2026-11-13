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
- **Pure helpers** — OKLCH color maths, date arithmetic, the pagination
  page-window algorithm, control sizing tables.

## Consuming it

There are sixty-six component stylesheets, and each one can be imported on its
own:

```ts
import "@ui-organized/core/components/Button/Button.css";
```

Svelte and Vue components import their stylesheets one at a time from here, so
a bundler drops the sheets of components an app doesn't use. Both libraries'
entries also import `typography.css` and `base.css`, the rules every component
shares. React bundles the component sheets at build time into the one file
`@ui-organized/react/styles.css` serves, and Angular takes the whole bundle as a
global style.

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

## Overriding component styles

Component state rules are kept at the specificity of **one class**. Hover and
press are wrapped in `:where()` (`.btn--secondary:where(:hover:not(:disabled))`),
so a single class of your own, loaded after this stylesheet, restyles every
state. You never need to stack classes to win.

Focus rings are drawn with `outline` (2px, `--color-interactive-focus`), never
`box-shadow`. Give a component a shadow of your own and the ring stays, and it
survives forced-colors mode, which drops shadows. Don't set `outline: none` on
a focusable part unless you draw a replacement.

## What must never end up here

Anything that imports a framework, touches the DOM, or assumes a renderer. If a
helper needs `document`, it belongs in the framework package that uses it.
