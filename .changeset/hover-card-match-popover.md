---
"@ui-organized/react": patch
---

HoverCard now shares the Popover's Figma-aligned surface. The panel adopts `border-primary`, `space-03` (12px) padding, the Figma `shadow-strong`, and the 120ms enter/exit transition — replacing the older `border-data-entry` + two-layer shadow + 16px inset. The 320px preview max-width is unchanged.

The pointer arrow has been removed: the `HoverCardArrow` export, the `HoverCardArrowProps` type, and the `showArrow` prop on `HoverCardContent` are gone. HoverCard and Popover are now one surface that differs only in trigger behaviour (hover/focus vs. click).
