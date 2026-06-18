---
"@ui-organized/react": major
---

Toggle / ToggleGroup: migrate the underlying primitive from Base UI to Ark UI.

`ToggleProps` and `ToggleGroupProps` are re-authored (they were
`ComponentProps<typeof BaseToggle / BaseToggleGroup>`). Documented props are
preserved — Toggle: `pressed`, `defaultPressed`, `onPressedChange`, `value`,
`size`, `icon` (+ standard button attrs); ToggleGroup: `value`, `defaultValue`,
`onValueChange`, `multiple`, `disabled`, `orientation` (+ standard div attrs).
Base-UI-specific props beyond these are no longer accepted.

DOM / attribute shift: emits Zag's `data-part` / `data-scope` / `data-state`
(pressed is now `data-state="on"`) instead of Base UI's DOM and `data-pressed`.
Consumers with custom CSS overrides or e2e selectors must update them.
