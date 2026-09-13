---
"@ui-organized/core": minor
"@ui-organized/react": minor
"@ui-organized/svelte": minor
"@ui-organized/vue": minor
"@ui-organized/angular": minor
---

**ColorPicker: the popup's notation row, redrawn to the design — and given to all four libraries.**

The format select now takes a **full-width row of its own**, with the channel fields on the row beneath it, and both are the library's own **`Select` and `Input`** rather than a bare `<select>` and `<input>` dressed to resemble them. Two controls that live inside a popup are still controls: they now pick up the field chrome — surface, hairline, radius, focus ring, disabled treatment, and the `sm` height and padding — from the same rules every other form control reads, and keep them when that chrome moves.

The cost is that the picker opens a second surface above the one it is already showing. The dismissable-layer stack under all four libraries is built for exactly that — a select opened inside a dialog closes itself and leaves the dialog alone — so the picker stays open while the notation list is up. That is pinned by interaction tests on all three engines.

**The row itself is new in Svelte, Vue and Angular.** It existed only in React before, which meant three of the four pickers could be driven by eye and not by number. All four now offer HEX / RGB / HSL / OKLCH, with the same channels in the same order, from one shared table:

```ts
import { COLOR_NOTATIONS, COLOR_NOTATION_FIELDS } from "@ui-organized/core";
```

`@ui-organized/core` also now exports the OKLCH ⇄ sRGB maths (`rgbaToOklch`, `oklchToRgba`, `formatOklch`, `parseOklch`), which moved out of the React package so four libraries share one copy of arithmetic rather than four that can drift. Nothing was removed from `@ui-organized/react`'s public API — the helpers were internal there.

**`showFormatInputs`** — already on the React picker — is now on the Svelte, Vue and Angular ones too. It defaults to `true`; turn it off for a picker meant to be driven by eye.

Also in this change:

- The popup is the design's **240px** and sizes as `border-box`, so the number describes the popup rather than its content box.
- The popup carries an accessible name in every library. Ark gives it `role="dialog"`, and a dialog with no name reaches a screen reader unnamed (axe `aria-dialog-name`) — React already named it; Svelte, Vue and Angular now do too.
- **`UioInput`** (Angular) accepts `value`, `aria-label`, `inputMode`, `spellcheck`, `min`, `max` and `step`. Angular has no prop spread, so native attributes have to be declared, and these are the ones a control inside a popup needs. `readOnly` now flags the control rather than the field — the root reports no `data-readonly`, matching React, for the reason the component already gives for `data-disabled`.
