---
"@ui-organized/core": minor
"@ui-organized/react": minor
"@ui-organized/svelte": minor
"@ui-organized/vue": minor
"@ui-organized/angular": minor
---

Tag gains colours, an appearance, a pill shape, a dot and a remove button. TagGroup is new.

**Tag**
- `variant` gains `brand`, which follows the theme, and `neutral`. Brand's subtle colours are derived from tokens every theme already has, so no theme needs re-exporting.
- `appearance` is `solid` (the default), `subtle` or `outline`.
  - `emphasized` is deprecated: `true` maps to solid and `false` to subtle, and `appearance` wins when both are given.
  - Existing Tags render the same DOM as before.
- `shape` is `square` (the default) or `pill`.
- `dot` adds a leading status dot.
- A remove button now follows the label. It is spelled as on Chip in each library: React `onRemove`, Svelte `onremove`, Vue `removable` with `@remove`, Angular `removable` with `(remove)`. Each takes a `removeLabel`.

**TagGroup** (new in all four libraries; `a[uioTagGroup]` or `span[uioTagGroup]` in Angular) is the announcement pill. It holds a short tag and a message, such as "New ▸ We've shipped dark mode".
- `variant`, `size` (`md` or `lg`) and `tagPosition` (`leading` or `trailing`).
- With `href`, the whole pill is one link with a trailing chevron.
- It is one pill, not a list of tags.
