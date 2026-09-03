# @ui-organized/angular

Angular component library for the **ui-organized** design system, built on the
[Angular CDK](https://material.angular.dev/cdk/categories) and themed entirely
through design tokens (CSS custom properties from
[`@ui-organized/tokens`](https://www.npmjs.com/package/@ui-organized/tokens)).

The same 68 components the React, Svelte and Vue libraries ship, rendering the
same DOM: one stylesheet, one set of class names, one token contract. A gate in
this repo renders every component in every library and diffs the markup, so
"same component" is asserted rather than intended.

Ark UI has no Angular package, so the overlays here are built on the CDK's
overlay and portal primitives rather than on Zag state machines. Same rendered
result, different engine underneath.

## Install

```sh
npm install @ui-organized/angular @ui-organized/tokens @angular/cdk
```

`@angular/core`, `@angular/common`, `@angular/forms` and `@angular/cdk` (>=21)
are peer dependencies. Every component is standalone — there is no NgModule to
import.

## Icons

Icon packs are **optional** peers, and genuinely so: this package imports none of
them. Install the one you want and register it with a single import.

```sh
npm install @ng-icons/lucide        # or @ng-icons/tabler-icons, or @ng-icons/heroicons
```

```ts
// once, near your app entry
import "@ui-organized/angular/icons/lucide";
```

```ts
import { provideIconConfig } from "@ui-organized/angular";

bootstrapApplication(App, {
  providers: [provideIconConfig({ library: "lucide", style: "outline" })],
});
```

```html
<span uioIcon name="search" label="Search"></span>
```

The subpath is the only module that touches `@ng-icons/lucide`, so the two packs
you didn't choose are never resolved — not at install, not at build. Forget the
import and the icon renders nothing and logs the line to add.

`provideIconConfig` accepts a signal as well as a plain object, so a theme
switcher flipping `style` to `"solid"` re-renders every icon below it:

```ts
providers: [provideIconConfig(computed(() => ({ library: "lucide", style: iconStyle() })))];
```

## Usage

Import the stylesheets once, at your app entry, **in this order**:

```ts
// src/main.ts
import "@ui-organized/tokens/variables.css"; // 1. token baseline
import "@ui-organized/angular/styles"; // 2. component styles
import "@ui-organized/angular/overlay.css"; // 3. CDK overlay positioning
import "./styles/theme.css"; // 4. your theme — last, so it wins
```

Order is load-bearing. A theme and the baseline both declare on `:root`, and
`:root` vs `:root` is a specificity tie — decided by source order. Import the
theme earlier and the baseline silently wins.

`overlay.css` is this library's only extra: the CDK renders an overlay into a
pane it positions itself, and these rules are what make a dialog, popover or menu
land where the other three libraries put theirs. Skipping it leaves every overlay
unpositioned.

Most components are **attribute directives** on your own element, so the tag
stays yours:

```html
<button uioButton intent="primary">Save</button> <span uioTag variant="success">Active</span>
```

The overlays own their host instead, because they project content into a surface
they control:

```html
<uio-dialog [(open)]="open">
  <button uioDialogTrigger>Open</button>
  <h2 uioDialogTitle>Title</h2>
</uio-dialog>
```

Form controls implement `ControlValueAccessor`, so `[(ngModel)]` and
`[formControl]` work without a wrapper.

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
