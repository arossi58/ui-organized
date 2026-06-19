---
"@ui-organized/react": major
---

Accordion and Collapsible: migrate from Base UI to Ark UI.

- **Collapsible** keeps its public API (`open` / `defaultOpen` /
  `onOpenChange(open)` / `disabled`, plus `render` on the trigger and panel).
  The height animation is now driven by Ark/Zag's `--height` + `data-state`
  keyframes instead of Base UI's `--collapsible-panel-height` transition (Zag
  reads the CSS `animation-name`/`animationend` to time unmount).
- **Accordion** keeps its `items` API. Two behavioral notes: (1) Ark/Zag's
  accordion has no panel height measurement, so open/close is now instant rather
  than height-animated; (2) Zag accordion values are strings, so numeric `value`
  items are coerced to strings — `onValueChange` reports string values. The
  trigger is wrapped in an `<h3>` (Ark has no Header part) and the chevron now
  rotates off `[data-state="open"]` (was `[data-panel-open]`); the disabled
  trigger styles off native `:disabled` (was `[data-disabled]`).
