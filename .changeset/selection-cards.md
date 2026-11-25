---
"@ui-organized/core": minor
"@ui-organized/react": minor
"@ui-organized/svelte": minor
"@ui-organized/vue": minor
"@ui-organized/angular": minor
---

RadioCardGroup and CheckboxCardGroup: radio and checkbox choices as cards.

- **What each card is:** a title, an optional description and an optional icon. The card is the control's `<label>`, so the whole card is the target.
- **Props:**
  - `options` (`{ value, label, description?, icon?, disabled? }`)
  - `label`, and `columns` (1 to 4)
  - `size` (`sm` or `md`)
  - `indicator`, which puts the radio or check box at the `start` or `end`
  - `disabled`, `name`, and `error` (a message, or `true`)
- **Values:** RadioCardGroup takes one `value`. CheckboxCardGroup takes `value: string[]` and is built on Ark's checkbox group.
- **Accessibility:** each input is named by its title alone and described by its description. An error message describes the whole group.
- **Angular:** `div[uioRadioCardGroup]` and `div[uioCheckboxCardGroup]`, both form controls.
- **Selective CI:** the card styles are shared in `SelectionCard/SelectionCard.css`, and a change to that file selects both card groups in CI.
