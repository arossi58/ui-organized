---
"@ui-organized/react": major
---

Select: migrate from Base UI to Ark UI's select (and from Base UI Field to Ark
Field for the surrounding label / helper / error chrome).

The public `options` API is unchanged. Internally the dropdown is now driven by
an Ark `createListCollection` rather than `Select.Item` children, the value is
adapted between the facade's single `string` and Zag's `string[]`, and a
`HiddenSelect` is rendered for form submission. Selector remaps: the open
trigger keys off `[data-state="open"]` (was `[data-popup-open]`), the selected
item off `[data-state="checked"]` (was `[data-selected]`), the popup width off
`var(--reference-width)` (was `var(--anchor-width)`), the placeholder colour off
the trigger's `[data-placeholder-shown]`, and the exit animation off
`[data-state="closed"]`. `invalid` is passed to the Ark root so the trigger's
`[data-invalid]` border still lights up.
