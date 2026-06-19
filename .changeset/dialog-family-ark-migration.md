---
"@ui-organized/react": major
---

Dialog, AlertDialog, and Sheet: migrate from Base UI to Ark UI's dialog
(AlertDialog uses `role="alertdialog"`; Sheet is the edge-anchored variant).

The composable facade types for all three are re-authored (were
`ComponentProps<typeof Base*.*>`). Documented props are preserved
(`open`/`defaultOpen`/`onOpenChange`/`modal`; Content `size`/`showClose`/
`container`; Sheet `side`; triggers/close still take `render`). DOM/attribute
shift: a `Positioner` now centers the popup (Base UI's popup self-centered),
`Popup`→`Content`, `Close`→`CloseTrigger`, and enter/exit is driven by Zag's
`data-state` (was `data-starting-style`/`data-ending-style`). Custom CSS / e2e
selectors must update.
