---
"@ui-organized/core": minor
"@ui-organized/react": minor
"@ui-organized/svelte": minor
"@ui-organized/vue": minor
"@ui-organized/angular": minor
---

DescriptionList and DescriptionListItem: terms and their details, such as a record's fields.

- **Content:** pass `items` (`{ term, details }[]`) for plain data, or `DescriptionListItem` children (a `term` plus details as content) for details that need markup. Items render before any children.
- **Columns:** every term lines up in one column, through CSS subgrid, however long its neighbours are. The column's width is the component-local `--description-list-term-width` (default `max-content`).
- **Props:** `layout` is `inline` or `stacked`, `size` is `sm` or `md`, and `divided` draws a rule between rows.
- **Angular:** `<dl uioDescriptionList [items]>` and `<div uioDescriptionListItem term>`.
