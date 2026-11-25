---
"@ui-organized/core": minor
"@ui-organized/react": minor
"@ui-organized/svelte": minor
"@ui-organized/vue": minor
"@ui-organized/angular": minor
---

Input takes icons and add-ons.

- **`startIcon` and `endIcon`** draw an icon inside the control, as SearchInput's search glass does.
- **`startAddon` and `endAddon`** sit beside the control inside one border.
  - Either can be text, such as `https://` or `.com`.
  - Either can be a control of its own, such as a ghost `Select` or a `Button`.
  - Slots by library: React takes any node; Svelte takes a string or a snippet; Vue takes a string prop or the `#start-addon` and `#end-addon` slots; Angular takes a string input or a projected `[uioInputStartAddon]` / `[uioInputEndAddon]`, where the element is the slot itself.
- **The shell takes the control's states.** That covers its border, background, height, hover, focus ring (including the quieter pointer-focus border), invalid and disabled.
  - The control's own surface is dropped inside it.
  - A focused Select or Button in an add-on draws its own ring.
- **Text add-ons describe the control.** A screen reader reads `https://` and `.com` with the field. They are joined to the helper and error text Ark already describes it by, not put in their place.
- An Input without add-ons renders as before. SearchInput, PasswordInput and NumberField are unchanged.
