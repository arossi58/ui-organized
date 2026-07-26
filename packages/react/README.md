# @ui-organized/react

React component library for the **ui-organized** design system, built on
[Ark UI](https://ark-ui.com/) and themed entirely through design tokens
(CSS custom properties from [`@ui-organized/tokens`](https://www.npmjs.com/package/@ui-organized/tokens)).

## Install

```sh
npm install @ui-organized/react @ui-organized/tokens
```

`react` and `react-dom` (>=18) are peer dependencies. Icon libraries are
**optional** peers — install whichever set you use:

```sh
npm install lucide-react        # or @tabler/icons-react, or @heroicons/react
```

Optional means the package won't install one for you, and picking a library you
haven't installed fails at *import* time.

## Usage

Import the stylesheets once, at your app entry, **in this order**:

```ts
// src/main.tsx
import "@ui-organized/tokens/variables.css";  // 1. token baseline
import "@ui-organized/react/styles";          // 2. component styles
import "./styles/theme.css";                  // 3. your theme — last, so it wins
```

Order is load-bearing. A theme and the baseline both declare on `:root`, and
`:root` vs `:root` is a specificity tie — decided by source order. Import the
theme earlier and the baseline silently wins.

`@ui-organized/react/styles.css` is exported as an alias of `/styles`, so either
spelling resolves. Both carry TypeScript types, so neither needs a
`declare module` shim in your project.

```tsx
import { Button } from "@ui-organized/react";

export function Example() {
  return <Button intent="primary">Save</Button>;
}
```

## Theming

Components reference semantic *roles* — `--color-surface-primary`,
`--color-interactive-primary-default` — never literal colours, so re-theming
means redefining those properties.

`token-contract.json` ships with this package: the complete, generated list of
every custom property the components consume but don't define. It's derived from
the component CSS itself, so it can't fall out of date with the library.

Light and dark ship together and are switched by attribute, not by re-import:

```ts
document.documentElement.setAttribute("data-theme", "dark");
```

Pin the default in your HTML (`<html data-theme="light">`) so the first frame
paints correctly, before any JavaScript runs.

Full guide, including the three ways to produce a theme:
<https://uiorganized.com/docs/theming>.

## License

Apache-2.0
