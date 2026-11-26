---
"@ui-organized/core": minor
"@ui-organized/react": minor
"@ui-organized/svelte": minor
"@ui-organized/vue": minor
"@ui-organized/angular": minor
---

CommandMenu, and Kbd.

- **CommandMenu** is a search box over a list of commands, in a dialog near the top of the screen.
  - **Behaviour:** typing narrows the list by label or `keywords` and highlights the first match. The arrows move through it, wrapping at the ends; Enter or a click runs a command.
  - **Commands:** `group` lists a command under a heading, `icon` and `shortcut` draw beside it, and `disabled` keeps it listed but unable to run.
  - **Props:** `onSelect` is called with the command's `value`. `closeOnSelect` (on by default) closes the menu afterwards. The query resets each time it closes.
  - **`hotkey`**, such as `"mod+k"`, toggles it from anywhere on the page. It is off unless set. A shortcut with no modifier never fires while someone is typing in a field.
  - **Focus** stays in the search box, a combobox whose active descendant is the highlighted command. Escape closes the menu and returns focus.
  - **Per library:** React and Svelte take `open` / `onOpenChange` / `onSelect`. Vue uses `v-model:open` and `@select`. Angular is `<uio-command-menu [(open)] (select)>`.
- **Kbd** draws a key, or a shortcut as a row of keys: `keys={["mod", "k"]}`, or one key as children. `mod` is ⌘ on a Mac and Ctrl elsewhere, and a key drawn as a symbol carries its spoken name. `platform` is `auto` by default: `other` on the server and first render, then the reader's own. Angular is `<kbd uioKbd>`.
- **Angular's UioDialog** takes `label` (an accessible name for a dialog with no title) and `contentClass`.
- **Core** exports `detectPlatform`, `formatKey`, `parseHotkey`, `hotkeyKeys`, `matchesHotkey`, `isTextEntry`, `createContains` (the locale-aware filter Combobox and CommandMenu share), and the CommandMenu helpers `filterCommandItems`, `groupCommandItems`, `orderCommandItems` and `firstCommand`.
