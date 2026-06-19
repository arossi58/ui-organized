---
"@ui-organized/react": major
---

ContextMenu and Menubar: migrate from Base UI to Ark UI.

- **ContextMenu** is now a Menu with a right-click `ContextTrigger` (Ark has no
  separate context-menu primitive). The facade types are re-authored; items gain
  an optional `value` (generated when omitted) and `onSelect`. The trigger area
  renders a `<div>` (projected via Ark's asChild) as before. DOM/attribute shift
  to Zag (`data-starting/ending-style`→`data-state`).
- **Menubar** has no Ark equivalent, so it is now a `role="menubar"` container
  (its `MenubarProps` is re-authored to div attrs + `orientation`). The menus
  inside are independent Ark menus — arrow-key movement *between* top-level menus
  is no longer coordinated. The open-trigger style now keys off
  `[data-state="open"]` (was `[data-popup-open]`).
