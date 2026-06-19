---
"@ui-organized/react": major
---

Combobox: migrate from Base UI to Ark UI's combobox (and from Base UI Field to
Ark Field for the surrounding chrome).

The public `options` API is unchanged. Filtering is now explicit: the input text
is mirrored into a reactive `createListCollection` filtered with Ark's
`useFilter` (`contains`, base sensitivity), and items render from
`collection.items`. The facade's single `string` value is adapted to Zag's
`string[]`. Selector remaps: the open trigger keys off `[data-state="open"]`
(was `[data-popup-open]`), the selected item off `[data-state="checked"]` (was
`[data-selected]`), the popup width off `var(--reference-width)` (was
`var(--anchor-width)`), and the exit animation off `[data-state="closed"]`.

Form submission note: Ark places `name` on the text input, so a form now submits
the visible input text rather than a hidden value field. The `invalid`/`disabled`
state still flows through the Ark Field root (`.field[data-invalid]` /
`[data-disabled]`).
