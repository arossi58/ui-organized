---
"@ui-organized/core": minor
"@ui-organized/react": minor
"@ui-organized/svelte": minor
"@ui-organized/vue": minor
"@ui-organized/angular": minor
---

PageHeader, SectionHeader and SectionFooter.

- **PageHeader** is the top of a page.
  - **Content:** a breadcrumb trail, the title and description, the page's actions, and an optional row of tabs whose panels hold the page body.
  - **Layout:** the actions sit beside the title and wrap below it in a narrow container, without a media query.
  - **Props:** `size` is `md` (app pages) or `lg` (docs and landing pages). `headingLevel` defaults to 1. `divided` draws a rule under the header.
  - **Not a landmark:** the root is a plain block, so a page keeps the one banner its app header provides.
- **SectionHeader** does the same one level down: title, description and actions, with `size` (`sm` | `md`), `align` (`start` | `center`), `headingLevel` (default 2) and `divided`.
- **SectionFooter** closes a section, with a status line at the start and actions at the end.
- **Slots per library:** React takes props; Svelte, snippets; Vue, slots. Angular uses `div[uioPageHeader]` with `[uioPageHeaderBreadcrumbs]`, `[uioPageHeaderActions]` and `[uioPageHeaderTabs]`, and likewise for the other two.
