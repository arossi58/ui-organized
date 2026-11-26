---
"@ui-organized/core": minor
"@ui-organized/react": minor
"@ui-organized/svelte": minor
"@ui-organized/vue": minor
"@ui-organized/angular": minor
---

Item and ItemGroup: a row with media, a title and a line of description, and actions at the end, such as a settings list or a list of people.

- **Content:** `title`, `description`, an `icon` (drawn in a tile) or any `media` (such as an Avatar), and `actions` (such as a Switch or a Button).
- **Links:** `href` (with `target` and `rel`) makes the whole row follow the link. It is a stretched link in the title, never an `<a>` around the row, so the actions stay their own controls above it. For a router link, React takes `linkRender` (cloned with the title), Vue `linkAs` and `linkProps`, and Angular a projected `<a uioItemLink>`.
- **Props:** `variant` is `plain`, `outline` or `muted`; `size` is `sm` or `md`; `headingLevel` renders the title as a heading; `titleId` and `descriptionId` let a control be named or described by the row.
- **ItemGroup:** a list (`role="list"`, each Item a list item), `divided` by default, and `variant="outline"` to put the rows in one frame.
- **Angular:** `<div uioItem>` with `[uioItemMedia]`, `[uioItemActions]` and `a[uioItemLink]`, inside `<div uioItemGroup>`.
