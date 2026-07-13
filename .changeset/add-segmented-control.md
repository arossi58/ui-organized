---
"@ui-organized/react": minor
---

Add `SegmentedControl` — a single-select control that lays mutually exclusive options in a shared track with a sliding pill marking the selection, per the Figma design. Built on Ark UI's `SegmentGroup` (keyboard nav + form participation via hidden radio inputs). Props: `items` (value/label, optional `icon`, per-item `disabled`), `value`/`defaultValue`/`onValueChange`, `size` (`sm`/`md`/`lg`), `disabled`, and `name`. Segments share equal width (sized to the widest label) and the whole component is theme-aware.
