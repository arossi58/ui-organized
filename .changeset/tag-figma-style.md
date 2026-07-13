---
"@ui-organized/react": patch
---

Tag now matches the Figma tag component. Emphasized (solid) tags draw their label in `content-light` (Figma `content/light`, #fcfcfc) across every variant — previously success/info/info-secondary/error used `content-primary` (dark text) and caution used `content-inverse`, which rendered dark, theme-dependent labels on the solid status fills. Also dropped the non-Figma `letter-spacing` so the type tracking matches the design (0). Sizes, padding, radius, and subdued (tinted) styles were already correct and are unchanged.
