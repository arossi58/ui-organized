---
"@ui-organized/react": patch
---

ScrollArea: a Root bounded by `max-height` rather than a fixed `height` now scrolls instead of clipping. The viewport inherits the Root's cap, so `<ScrollArea style={{ maxHeight: 320 }}>` behaves like the fixed-height form once the content outgrows it, and is unchanged when neither is set.
