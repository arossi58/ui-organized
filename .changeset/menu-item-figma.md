---
"@ui-organized/react": patch
---

Menu items now match the Figma spec: the label uses `body-medium` (14px) type and the leading icon is 20px (was `body-small`/12px). Also fixes `MenuCheckboxItem` so the check glyph actually renders when checked — the indicator was missing the `check` icon that the standalone `Checkbox` uses, so a checked item showed no mark.
