---
"@ui-organized/core": minor
"@ui-organized/react": minor
"@ui-organized/svelte": minor
"@ui-organized/vue": minor
"@ui-organized/angular": minor
---

Tabs take a look and counts; Divider takes a label.

- **Tabs `variant`:**
  - `underline` is the default and today's look.
  - `pill` fills the selected tab with the brand tint.
  - `bordered` sits the tabs in a track with the selected one raised.
  - All three work in both orientations.
- **Tabs `count` on an item** renders a small pill after the label. It is visible text, so it is read as part of the tab's name.
- **Divider label:**
  - **How you give it one:** children in React, Svelte and Vue; content plus the `labelled` attribute in Angular, since a directive can't see its content.
  - **What it does:** makes a divider that holds text or a control between two rules, with `labelPosition` set to `start`, `center` or `end`. A labelled divider is horizontal.
  - **Why it isn't a separator:** a separator's children are presentational, so the label would not be read.
