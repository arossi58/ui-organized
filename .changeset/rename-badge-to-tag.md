---
"@ui-organized/react": major
---

Rename `Badge` to `Tag` and restyle. The component, its props (`BadgeProps` → `TagProps`, `BadgeVariants` → `TagVariants`), and CSS classes (`.badge*` → `.tag*`) are renamed; the `variant`, `size`, and `emphasized` API is unchanged. Styling is more compact and modern — soft ~4px rounded corners (was a full pill), tighter padding, a smaller default font size, and lighter (medium) weight — inspired by Carbon tags and Atlassian lozenges.

Adds an optional `icon` prop (canonical icon name or icon component) with `iconPosition` (`"left"` | `"right"`, default `"left"`). The icon renders at 16px across every tag size, sits `spacing-01` from the label, inherits the tag's color, and never shrinks (the label truncates instead).

Migration: replace `import { Badge } from "@ui-organized/react"` with `Tag`, and `<Badge …>` with `<Tag …>`.
