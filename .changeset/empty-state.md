---
"@ui-organized/core": minor
"@ui-organized/react": minor
"@ui-organized/svelte": minor
"@ui-organized/vue": minor
"@ui-organized/angular": minor
"@ui-organized/table-core": minor
"@ui-organized/react-table": minor
"@ui-organized/svelte-table": minor
"@ui-organized/vue-table": minor
"@ui-organized/angular-table": minor
---

EmptyState, in all four libraries. It shows what to put where content would be but isn't: an icon or illustration, a title, a sentence on why, and the actions that fill the space.

- `icon` draws a neutral FeaturedIcon sized to the empty state. The `media` slot overrides it, for an illustration.
- `actions` is a slot. In Angular it is `div[uioEmptyStateActions]`, and media is `div[uioEmptyStateMedia]`.
- `size` is `sm` for a table cell or card, `md` for a panel, or `lg` for a page.
- The title is a paragraph unless you set `headingLevel` (1 to 6), so the default never breaks a page's heading outline.

The tables' empty state is now this component at the small size, so all four `TableEmpty`s look the same as an EmptyState elsewhere. `TableEmpty` and the `empty` table option both gain an `icon`.
