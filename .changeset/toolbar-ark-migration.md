---
"@ui-organized/react": major
---

Toolbar: drop Base UI (Ark UI has no Toolbar primitive).

The facade now owns the accessible markup directly: a `role="toolbar"` container
with native `<button>`/`<a>`/`<input>` and `role="separator"`. All `Toolbar*`
types are re-authored to native element attrs (`Toolbar` gains `orientation`).
Documented usage is unchanged, but arrow-key roving focus *between* toolbar items
is no longer coordinated (each control is individually tabbable). The toggle-in-
toolbar pressed style now keys off `[data-state="on"]` (the migrated Toggle's
attribute) instead of `[data-pressed]`.
