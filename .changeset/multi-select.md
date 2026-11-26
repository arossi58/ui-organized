---
"@ui-organized/core": minor
"@ui-organized/react": minor
"@ui-organized/svelte": minor
"@ui-organized/vue": minor
"@ui-organized/angular": minor
---

`multiple` on Select and Combobox.

- **What it shows:** the chosen values as removable tags on one line. Those that do not fit fold into a "+N" tag, and a clear button removes them all. The field keeps its height.
- **Select:** the list stays open while choosing. The trigger still reads out every chosen value, and the tags are hidden from screen readers so nothing is announced twice. A ghost Select is single only.
- **Combobox:** picking toggles a value, clears the query and keeps the list open. Backspace in an empty box removes the last value.
  - The values are submitted as one hidden input each under `name`, because the text box holds the query.
  - A multiple Combobox cannot be `required`.
- **Values per library:**
  - React takes `string[]` on `value`, `defaultValue` and `onValueChange` when `multiple` is set.
  - Svelte's Select and Combobox are now generic over `multiple`, so `bind:value` is a `string[]` when it is set.
  - Vue keeps `v-model` a `string` and carries the values on `v-model:values` (with `defaultValues` and `@values-change`), so existing typed `@value-change` handlers are unaffected.
  - Angular has a separate `values` model, as on Calendar's `range`, and its form control reads and writes `string[]`.
- **`clearLabel`** names the clear button. It defaults to "Clear all".
- **Core** exports `fitTagCount`, `measureTagRow` and `TAG_MORE_WIDTH`, the overflow maths all four share.
