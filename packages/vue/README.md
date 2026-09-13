# @ui-organized/vue

Vue component library for the **ui-organized** design system, built on
[Ark UI](https://ark-ui.com/) and themed entirely through design tokens
(CSS custom properties from [`@ui-organized/tokens`](https://www.npmjs.com/package/@ui-organized/tokens)).

The same 68 components the React, Svelte and Angular libraries ship, rendering
the same DOM: one stylesheet, one set of class names, one token contract. A gate
in this repo renders every component in every library and diffs the markup, so
"same component" is asserted rather than intended.

## Install

```sh
npm install @ui-organized/vue @ui-organized/tokens
```

`vue` (>=3.5) is a peer dependency.

## Icons

Icon libraries are **optional** peers, and genuinely so: this package imports
none of them. Install the one you want and register it with a single import.

```sh
npm install @lucide/vue        # or @tabler/icons-vue, or @heroicons/vue
```

```ts
// once, near your app entry
import "@ui-organized/vue/icons/lucide";
```

```vue
<script setup>
import { Icon, IconProvider } from "@ui-organized/vue";
</script>

<template>
  <IconProvider library="lucide" style="outline">
    <Icon name="search" label="Search" />
  </IconProvider>
</template>
```

The subpath is the only module that touches `@lucide/vue`, so the two libraries
you didn't choose are never resolved — not at install, not at build. Forget the
import and `<Icon>` renders nothing and logs the line to add.

Prefer not to rely on import side effects? Pass the set explicitly:

```vue
<script setup>
import { lucideIcons } from "@ui-organized/vue/icons/lucide";
</script>

<template>
  <IconProvider library="lucide" :icons="lucideIcons">
</template>
```

You can also hand `<Icon>` a component directly, which needs no registration and
no canonical name:

```vue
<script setup>
import { Rocket } from "@lucide/vue";
</script>

<template>
  <Icon :name="Rocket" label="Launch" />
</template>
```

## Usage

Import the stylesheets once, at your app entry, **in this order**:

```ts
// src/main.ts
import "@ui-organized/tokens/variables.css"; // 1. token baseline
import "@ui-organized/vue/styles"; // 2. component styles
import "./styles/theme.css"; // 3. your theme — last, so it wins
```

Order is load-bearing. A theme and the baseline both declare on `:root`, and
`:root` vs `:root` is a specificity tie — decided by source order. Import the
theme earlier and the baseline silently wins.

`@ui-organized/vue/styles.css` is exported as an alias of `/styles`, so either
spelling resolves.

```vue
<script setup>
import { Button } from "@ui-organized/vue";
</script>

<template>
  <Button intent="primary">Save</Button>
</template>
```

Events follow Vue's convention rather than React's — `@value-change`, `@remove` —
and the controllable ones support `v-model`: `<Select v-model="value" />`.

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
