---
"@ui-organized/react": patch
---

ContextMenu now matches the Figma menu surface and the Menu component 1:1. Aligned the popup surface (`border-primary` + Figma `shadow-strong`), item type scale (`body-medium`, 20px leading icon), destructive items (destructive-ghost fill on hover/press with light text), group-label colour (`content-primary`), and the separator (now the shared `<Divider>`). Checkbox items render the same check-glyph as the standalone Checkbox. ContextMenu and Menu are now one visual component that differ only in trigger behaviour (right-click/cursor-anchored vs. click/trigger-anchored).
