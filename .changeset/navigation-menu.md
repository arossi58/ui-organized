---
"@ui-organized/core": minor
"@ui-organized/react": minor
"@ui-organized/svelte": minor
"@ui-organized/vue": minor
"@ui-organized/angular": minor
---

NavigationMenu: a site's top navigation, with triggers that each open a panel of links and links that go straight to a page.

- **Parts:** `NavigationMenu` (`value`, `defaultValue`, `onValueChange`, `openDelay` 200, `closeDelay` 300), `NavigationMenuItem` and `NavigationMenuLink`.
- **`NavigationMenuItem`:** `value` (required, as it ends up in ids) and `label`. With `href` (and `current`) the item is a link in the bar; otherwise a trigger whose panel holds the item's children, laid out in `columns` (1 to 3). With no `label`, its only content is a `NavigationMenuLink`, which is how a router link sits in the bar.
- **`NavigationMenuLink`:** `href`, `current`, `closeOnClick`, and in a panel an optional `icon` and `description`. Router links: React `render`, Vue `as`, Angular `a[uioNavigationMenuLink]` (the host is the anchor, so `routerLink` goes on it).
- **Behaviour (zag's):** a mouse hover opens a panel after `openDelay`, or at once when another is open, and leaving closes it after `closeDelay`; a click toggles it. Left, Right, Home and End move along the bar without wrapping, ArrowDown enters an open panel, and Escape, a press outside or focus leaving the menu closes it, returning focus to the trigger when it was inside the panel. Following a link closes it.
- **Panels** render inline under their item and are `hidden` while closed, so their links are server-rendered.
- **React, Svelte and Vue** are built on Ark's navigation menu. Svelte and Vue import it from its subpath (`@ark-ui/svelte/navigation-menu`, `@ark-ui/vue/navigation-menu`), as neither Ark build lists it in its main entry. React renders a panel from the menu's own props rather than through Ark's `Content` part, which reads `document` while it renders and so cannot render on the server. **Angular** (`nav[uioNavigationMenu]`, `div[uioNavigationMenuItem]`, `a[uioNavigationMenuLink]`) runs the same machine by hand.
- v1 has no viewport, indicator or arrow, opens horizontally only, and does not collapse on a narrow screen.
