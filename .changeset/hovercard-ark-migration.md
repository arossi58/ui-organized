---
"@ui-organized/react": major
---

HoverCard: migrate from Base UI's PreviewCard to Ark UI's hover-card.

The composable `HoverCard*` facade types are re-authored (were
`ComponentProps<typeof BasePreviewCard.*>`). Documented props are preserved
(`HoverCardContent`: `side`/`align`/`sideOffset`/`alignOffset`/`showArrow`/
`container`; `HoverCard`: `open`/`defaultOpen`/`onOpenChange`/`openDelay`/
`closeDelay`; `HoverCardTrigger` still takes `render`). DOM/attribute shift to
Zag's `data-part`/`data-scope`/`data-state` (Popup→Content, Zag-positioned
Arrow/ArrowTip); custom CSS / e2e selectors must update.
