---
"@ui-organized/react": major
---

Tooltip: migrate the underlying primitive from Base UI to Ark UI.

Documented props are unchanged (`content`, `children`, `side`, `align`,
`sideOffset`, `delay`, `closeDelay`, `showArrow`, `disabled`, `open`,
`defaultOpen`, `onOpenChange`, `container`). Two consumer-visible breaks:

- **`TooltipProviderProps` is re-authored.** It was `ComponentProps<typeof
  BaseTooltip.Provider>`; it is now a hand-authored `{ children; delay?;
  closeDelay? }`. Base-UI-Provider-only props (e.g. `timeout`) are no longer
  accepted — use `delay`/`closeDelay`.
- **DOM / attribute shift.** The tooltip now emits Zag's `data-part` /
  `data-scope` / `data-state` (and Zag-positioned `Arrow`/`ArrowTip`) instead of
  Base UI's DOM and `data-starting-style`/`data-ending-style`/`data-side`.
  Consumers with custom CSS overrides or e2e selectors targeting the old
  structure must update them. (Shared, umbrella break for the whole 2.0 line.)
