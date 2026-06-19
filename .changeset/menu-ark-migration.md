---
"@ui-organized/react": major
---

Menu: migrate from Base UI to Ark UI's menu.

The composable `Menu*` facade types are re-authored. Documented props are
preserved (`MenuContent` side/align/sideOffset/alignOffset/container;
checkbox/radio `checked`/`onCheckedChange`/`onValueChange`; items `icon`/
`destructive`). New: `MenuItem` accepts an optional `value` (Ark requires a
stable per-item value; a generated id is used when omitted) and an `onSelect`
callback; `Menu` no longer takes `modal` (not part of Ark's menu). DOM/attribute
shift to Zag (`Popup`→`Content`, `Group`→`ItemGroup`, indicators→`ItemIndicator`,
`data-starting/ending-style`→`data-state`). Custom CSS / e2e selectors must update.
