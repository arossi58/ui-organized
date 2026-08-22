---
"@ui-organized/svelte": minor
---

First release of `@ui-organized/svelte`: the design system's components for Svelte 5, built on Ark UI.

Twenty-four components — Accordion, Avatar, Button, Card, Checkbox, Combobox, Dialog, Divider, Field, FieldError, Icon, Input, Menu, Popover, Progress, RadioGroup, Select, Skeleton, Switch, Tabs, Tag, TextArea, Toast and Tooltip — sharing the React package's stylesheets, variant recipes and token contract through `@ui-organized/core`. Same class names, same `data-*` state attributes, same rendered ARIA, verified by a suite that renders both libraries and compares the resulting DOM.

Where Svelte idiom and API parity pulled in different directions, both are supported rather than one being chosen: controlled props (`value`, `open`, `checked`) are `$bindable`, so `bind:value` works, and the `onValueChange`-style callbacks the React package exposes fire alongside them.

Two deliberate divergences, both documented on the components:

- Polymorphic rendering is `asChild` — a snippet receiving the props to spread — rather than React's `render` prop, matching Ark's own Svelte convention so a ui-organized Button composes with an Ark trigger the way an Ark part does. `Button`'s `asChild` also receives the button's content, since that content is the icon and the label in the order `iconPosition` asks for, not just `children`.
- `Tooltip` always renders an Ark trigger. React inspects its children with `isValidElement` and projects onto a single element child; a Svelte snippet is opaque and cannot be asked whether it renders one element.

Component stylesheets are imported per component, so an app that uses three ships three. `@ui-organized/svelte/styles` is there for consumers who would rather take the lot at once.

Published at `0.1.0` while the remaining components are ported.
