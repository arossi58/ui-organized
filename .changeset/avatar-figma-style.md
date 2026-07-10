---
"@ui-organized/react": patch
---

Align `Avatar` with the Figma design: add a 1px `border-primary` border, switch the fallback background from `interactive-ui-default` to the theme-aware `interactive-secondary-default` overlay, and set `box-sizing: border-box` so the fixed sizes stay exact with the border. The `xl` size now uses the heading font token to match its `heading-small` type style. Sizes (24/32/40/48/64) and shapes (circle/rounded/square) were already correct.
