# @ui-organized/react

React component library for the **ui-organized** design system, built on
[Ark UI](https://ark-ui.com/) and themed entirely through design tokens
(CSS custom properties from [`@ui-organized/tokens`](https://www.npmjs.com/package/@ui-organized/tokens)).

## Install

```sh
npm install @ui-organized/react @ui-organized/tokens
```

`react` and `react-dom` (>=18) are peer dependencies.

## Icons

Icon libraries are **optional** peers, and genuinely so: this package imports
none of them. Install the one you want and register it with a single import.

```sh
npm install lucide-react        # or @tabler/icons-react, or @heroicons/react
```

```ts
// once, near your app entry
import "@ui-organized/react/icons/lucide";
```

```tsx
import { Icon, IconProvider } from "@ui-organized/react";

<IconProvider library="lucide" style="outline">
  <Icon name="search" label="Search" />
</IconProvider>
```

The subpath is the only module that touches `lucide-react`, so the two libraries
you didn't choose are never resolved — not at install, not at build. Forget the
import and `<Icon>` renders nothing and logs the line to add.

Prefer not to rely on import side effects? Pass the set explicitly:

```tsx
import { lucideIcons } from "@ui-organized/react/icons/lucide";

<IconProvider library="lucide" icons={lucideIcons}>
```

You can also hand `<Icon>` a component directly, which needs no registration and
no canonical name:

```tsx
import { Rocket } from "lucide-react";

<Icon name={Rocket} label="Launch" />
```

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
