---
"@ui-organized/react": patch
---

Align `Alert` with the Figma design: removed the 1px status-colored border so the alert is now a borderless filled block, tightened the vertical padding to `space-03`/`space-04` (was `space-04` on all sides), bumped the status icon to 20px (was 18px) and the dismiss icon to 20px (was 16px), and dropped the icon's 1px top nudge so it aligns flush with the title. Backgrounds and text continue to use the `status/*-bg` and `status/*-content` tokens.
