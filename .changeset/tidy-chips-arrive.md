---
"@ui-organized/core": minor
"@ui-organized/react": minor
"@ui-organized/svelte": minor
"@ui-organized/vue": minor
"@ui-organized/angular": minor
"@ui-organized/utils": minor
---

**New: `Chip`** — a compact token standing for something the user _added_, in all four libraries.

```tsx
<Chip label="Role" detail="is any of">Owner, Admin</Chip>
<Chip label="Team" onRemove={drop} removeLabel="Remove team: Design">Design</Chip>
```

It is not a variant of `Tag`, and the difference is worth stating: a `Tag` reports status the user did not choose and is a non-focusable `<span>`; a `Chip` is interactive, and usually interactive in **two ways at once** — a body that opens something, and a dismiss control that removes it.

That is the structural decision the component exists to hold. The dismiss control is a **sibling** of the body, never inside it, because a button within a button is invalid HTML and an axe `nested-interactive` violation — and the wrapper is what makes two controls look like one object. A chip that opens nothing renders a `<span>` body rather than a `<button>`, so a list of static tokens does not become a list of empty tab stops.

A chip reads as a short sentence: `label` names the thing, the middle is the relation, and the children are the value. Only the value truncates — losing the end of "Admin, Owner" still reads, losing the end of "Role" does not.

**The relation is drawn or spelled.** `operator` picks one of six first-party comparison glyphs — `equals`, `is-any-of`, `contains`, `does-not-contain`, `starts-with`, `ends-with` — and `detail` is the words for relations that have none ("is in the last", "is between"). Pass `operatorLabel` alongside a glyph: it becomes the glyph's accessible name, so the chip still reads as "Name contains ada" to a screen reader rather than losing the relation entirely.

The glyphs are **first-party**: they are not in Lucide, Tabler or Heroicons, have no canonical name, and so cannot go through the registry the three third-party packs share. `@ui-organized/core` exports them as markup (`COMPARISON_ICONS`), because a string is the only thing portable between four libraries — the same reason `@ng-icons` ships strings and Angular's `UioIcon` already accepts one. They are generated from the designer's SVGs in `packages/core/src/icons/`, with `#030303` rewritten to `currentColor` so a glyph takes its colour from the text beside it, and a test re-reads those files and fails if the two drift.

Also:

- **`selected`** (its popover is open, or it is toggled on) and **`incomplete`** (it does not yet stand for anything — dashed, because it is an invitation and not an error).
- **`dropdown`** draws a trailing chevron for a chip that opens a menu.
- **Every prop except `className` lands on the body**, which is what lets an overlay trigger project itself onto a chip — `<PopoverTrigger render={<Chip … />} />` — and have its `id`, `onClick` and `aria-expanded` attach to the element that actually opens the popover rather than to a wrapper that does nothing.
- `removeLabel` is the dismiss button's whole accessible name, and the component warns in development when `onRemove` is set without one: a row of chips whose buttons all say "Remove" gives assistive tech six identical controls.

No new tokens: the chip is drawn from `--color-interactive-ui-default`, `--color-border-data-entry` and the spacing scale, all of which every theme already supplies.

**Two new canonical icon names: `sort` and `rotate-ccw`.** `sort` is the direction-neutral affordance for a control that _opens_ sorting rather than expressing a direction, and `rotate-ccw` is the counter-clockwise pair of the `rotate-cw` the set already had. Both are mapped in every icon pack of every library; Heroicons has no distinct glyph for either, so it reuses the ones behind `sort-desc` and `undo`.
