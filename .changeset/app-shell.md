---
"@ui-organized/core": minor
"@ui-organized/react": minor
"@ui-organized/svelte": minor
"@ui-organized/vue": minor
"@ui-organized/angular": minor
---

AppShell and AppHeader: an application's frame, with a header across the top, a sidebar down the side, and the page in a `<main>` beside them.

- **`AppShell`:** `header`, `sidebar` and the page as children (Svelte snippets, Vue slots, Angular `[uioAppHeader]` content and an `ng-template[uioAppShellSidebar]`).
  - `layout`: `auto` (the default) shows the sidebar as a rail, and below `breakpoint` (900px) moves it into a sheet from the left. `rail` and `sheet` force one. `onLayoutChange` (Vue `layoutChange`, Angular `resolvedLayoutChange`) reports the layout in use.
  - The sheet: `navOpen` / `defaultNavOpen` / `onNavOpenChange` (Vue `v-model:nav-open`, Angular `[(navOpen)]`), `navTitle` ("Menu") and `portalContainer`. A click in it that goes to a page closes it, and so does crossing back to the rail.
  - `scroll`: `page` (the default), where the document scrolls under a sticky header and the rail sticks beside it, or `main`, where only the main area scrolls inside a parent of fixed height.
  - A skip link to the main area comes first (`skipLinkLabel`, `mainId`).
- **`AppHeader`:** `logo`, `nav` and `actions` (Angular `[uioAppHeaderLogo]`, `[uioAppHeaderNav]`, `[uioAppHeaderActions]`) and `menuLabel` ("Open navigation"). In the sheet layout it leads with the menu button and leaves `nav` out.
- **Server rendering:** `auto` renders a rail on the server and on the first client render, then switches once it has measured the viewport, so a hydrating page matches its markup. A stylesheet guard hides the rail on a narrow screen until then.
- **Sidebar:** inside an AppShell's sheet it is always expanded and has no collapse toggle. Outside one nothing changes. Core exports `isSidebarNavigation`, the check for a click that goes to a page.
- **Angular `UioSheet`** gains `panelClass`, a class for the panel itself.
