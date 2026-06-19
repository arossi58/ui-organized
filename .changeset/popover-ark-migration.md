---
"@ui-organized/react": major
---

Popover: migrate the underlying primitive from Base UI to Ark UI.

The composable `Popover*` facade types are re-authored (they were
`ComponentProps<typeof BasePopover.*>`). Documented `PopoverContent` props are
preserved (`side`, `align`, `sideOffset`, `alignOffset`, `showArrow`,
`container`), `PopoverTrigger` / `PopoverClose` still take `render`, and
`Popover` still takes `open` / `defaultOpen` / `onOpenChange` / `modal`. The
consumer-visible break:

- DOM / attribute shift to Zag's `data-part` / `data-scope` / `data-state` (and
  a Zag-positioned `Arrow`/`ArrowTip`); the `Popup` part is now `Content` and
  `Close` is `CloseTrigger`. Custom CSS / e2e selectors must update.
