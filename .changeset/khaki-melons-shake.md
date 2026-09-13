---
"@ui-organized/vue": minor
---

First release of `@ui-organized/vue`: the design system's components for Vue 3.5, built on Ark UI.

**All 68 components** the React and Svelte packages ship, sharing their stylesheets, variant recipes and token contract through `@ui-organized/core`. Same class names, same `data-*` state attributes, same rendered ARIA, verified by a gate that renders every library and diffs the resulting DOM — 1,812 static comparisons and 848 in a browser, on every run.

Controlled props use `v-model` (`v-model`, `v-model:open`, `v-model:checked`), and the `onValueChange`-style callbacks the React package exposes are emitted alongside them, so either style works.

Three things behave differently from the other libraries, all documented on the components:

- `asChild` is a **boolean** — Ark UI's Vue convention, with the merged props landing on the single root element the default slot renders. React takes an element and Svelte takes a snippet. `Button` renders through Ark's own `ark.button` factory so its `asChild` behaves exactly like an Ark trigger's.
- Overlays teleport with Vue's built-in `<Teleport>`. Ark UI ships no Portal component for Vue because the framework already has one.
- `Tooltip` always renders an Ark trigger rather than projecting onto a single element child, because a slot cannot be inspected the way React's `isValidElement` inspects children. The Svelte package has the same limitation for the same reason.

Component stylesheets are imported per component, so an app that uses three ships three. `@ui-organized/vue/styles` is there for consumers who would rather take the lot at once.

Published at `0.1.0` while the remaining components are ported.
