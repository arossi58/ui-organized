---
"@ui-organized/core": patch
---

Text on a brand-colored fill now uses the filled-button label, `--color-interactive-contents`, in three more places: the selected, hovered and pressed Navigation item, the checked SegmentedControl segment, and the current Steps indicator. They drew `--color-content-light`, which stays white whatever the brand, so a light brand such as candlelight read at 1.99:1 there in both modes. `--color-interactive-contents` is chosen against your brand's fill and turns dark when white wouldn't read. Nothing changes for brands where white already passed, including the default mars.

Also fixed in Navigation: the selected item lost its label color while it had keyboard focus, and showed the grey resting color on the brand fill (2.39:1 on mars in light mode).
