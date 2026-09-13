---
"@ui-organized/core": minor
"@ui-organized/react": minor
"@ui-organized/svelte": minor
"@ui-organized/vue": minor
"@ui-organized/angular": minor
---

Fix: `Pagination`'s list items carried no spacing of their own, so any page that styles `li` pushed the page buttons off the line they shared with everything beside them.

The row is a cluster of controls that happens to be marked up as a list — `.pagination__list` already zeroed the list's own margin and padding, but not the items'. A docs site, a CMS article, or any reset with list rhythm in it then added a bottom margin per `li` and one under the list, and the nav grew half a row taller than its buttons. In our own docs that read as a pagination row floating above the row count and the page-size select next to it, even though all three boxes were centred on the same line.

`.pagination__list > li { margin: 0; padding: 0 }`. Nothing changes for a page that was not styling list items.
