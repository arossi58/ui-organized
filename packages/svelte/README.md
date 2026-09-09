# @ui-organized/svelte

Svelte component library for the **ui-organized** design system, built on
[Ark UI](https://ark-ui.com/) and themed entirely through design tokens
(CSS custom properties from [`@ui-organized/tokens`](https://www.npmjs.com/package/@ui-organized/tokens)).

The same 68 components the React, Vue and Angular libraries ship, rendering the
same DOM: one stylesheet, one set of class names, one token contract. A gate in
this repo renders every component in every library and diffs the markup, so
"same component" is asserted rather than intended.

## Install

```sh
npm install @ui-organized/svelte @ui-organized/tokens
```

`svelte` (>=5.20) is a peer dependency. The components are written with runes.

## Icons

Icon libraries are **optional** peers, and genuinely so: this package imports
none of them. Install the one you want and register it with a single import.

```sh
npm install @lucide/svelte        # or @tabler/icons-svelte
```

```ts
// once, near your app entry
import "@ui-organized/svelte/icons/lucide";
```

```svelte
<script>
  import { Icon, IconProvider } from "@ui-organized/svelte";
</script>

<IconProvider library="lucide" style="outline">
  <Icon name="search" label="Search" />
</IconProvider>
```

The subpath is the only module that touches `@lucide/svelte`, so the library you
didn't choose is never resolved — not at install, not at build. Forget the import
and `<Icon>` renders nothing and logs the line to add.

Prefer not to rely on import side effects? Pass the set explicitly:

```svelte
<script>
  import { lucideIcons } from "@ui-organized/svelte/icons/lucide";
</script>

<IconProvider library="lucide" icons={lucideIcons}>
```

You can also hand `<Icon>` a component directly, which needs no registration and
no canonical name:

```svelte
<script>
  import { Rocket } from "@lucide/svelte";
</script>

<Icon name={Rocket} label="Launch" />
```

## Usage

Import the stylesheets once, at your app entry, **in this order**:

```ts
// src/main.ts
import "@ui-organized/tokens/variables.css"; // 1. token baseline
import "@ui-organized/svelte/styles"; // 2. component styles
import "./styles/theme.css"; // 3. your theme — last, so it wins
```

Order is load-bearing. A theme and the baseline both declare on `:root`, and
`:root` vs `:root` is a specificity tie — decided by source order. Import the
theme earlier and the baseline silently wins.

`@ui-organized/svelte/styles.css` is exported as an alias of `/styles`, so either
spelling resolves.

```svelte
<script>
  import { Button } from "@ui-organized/svelte";
</script>

<Button intent="primary">Save</Button>
```

Handlers follow Svelte 5's convention rather than React's — `onclick`, `onremove`
— and two-way props are bindable: `<Select bind:value />`.

## Theming

Components reference semantic _roles_ — `--color-surface-primary`,
`--color-interactive-primary-default` — never literal colours, so re-theming
means redefining those properties. The contract is shared with every other
library in the system, so a theme written once themes all four.

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
