# @ui-organized/react

## 4.0.0

### Major Changes

- af36060: Rename `Badge` to `Tag` and restyle. The component, its props (`BadgeProps` → `TagProps`, `BadgeVariants` → `TagVariants`), and CSS classes (`.badge*` → `.tag*`) are renamed; the `variant`, `size`, and `emphasized` API is unchanged. Styling is more compact and modern — soft ~4px rounded corners (was a full pill), tighter padding, a smaller default font size, and lighter (medium) weight — inspired by Carbon tags and Atlassian lozenges.

  Adds an optional `icon` prop (canonical icon name or icon component) with `iconPosition` (`"left"` | `"right"`, default `"left"`). The icon renders at 16px across every tag size, sits `spacing-01` from the label, inherits the tag's color, and never shrinks (the label truncates instead).

  Migration: replace `import { Badge } from "@ui-organized/react"` with `Tag`, and `<Badge …>` with `<Tag …>`.

### Minor Changes

- 67687e1: Add `SegmentedControl` — a single-select control that lays mutually exclusive options in a shared track with a sliding pill marking the selection, per the Figma design. Built on Ark UI's `SegmentGroup` (keyboard nav + form participation via hidden radio inputs). Props: `items` (value/label, optional `icon`, per-item `disabled`), `value`/`defaultValue`/`onValueChange`, `size` (`sm`/`md`/`lg`), `disabled`, and `name`. Segments share equal width (sized to the widest label) and the whole component is theme-aware.
- 980ecf0: Styling updates

### Patch Changes

- 67687e1: Align `Alert` with the Figma design: removed the 1px status-colored border so the alert is now a borderless filled block, tightened the vertical padding to `space-03`/`space-04` (was `space-04` on all sides), bumped the status icon to 20px (was 18px) and the dismiss icon to 20px (was 16px), and dropped the icon's 1px top nudge so it aligns flush with the title. Backgrounds and text continue to use the `status/*-bg` and `status/*-content` tokens.
- af36060: Align `Avatar` with the Figma design: add a 1px `border-primary` border, switch the fallback background from `interactive-ui-default` to the theme-aware `interactive-secondary-default` overlay, and set `box-sizing: border-box` so the fixed sizes stay exact with the border. The `xl` size now uses the heading font token to match its `heading-small` type style. Sizes (24/32/40/48/64) and shapes (circle/rounded/square) were already correct.
- a8e3b99: Card now matches the Figma card component. The `default` card gains the Figma surface: a 1px `border-primary` hairline on the primary surface, and the corner radius moves to `radius-06` (16px). Cards are now a flex column whose padding size (`sm`/`md`/`lg`) drives both the inset and the gap between sections at the Figma scale (8/12/16px), so `CardHeader`/`CardFooter` no longer add their own margins — they contribute only their divider rule.

  The `outlined` variant has been removed: the bordered look is now the `default`, so `variant` is `"default" | "elevated"`. Replace `variant="outlined"` with the default (drop the prop). `padding` is unchanged.

- 67687e1: ContextMenu now matches the Figma menu surface and the Menu component 1:1. Aligned the popup surface (`border-primary` + Figma `shadow-strong`), item type scale (`body-medium`, 20px leading icon), destructive items (destructive-ghost fill on hover/press with light text), group-label colour (`content-primary`), and the separator (now the shared `<Divider>`). Checkbox items render the same check-glyph as the standalone Checkbox. ContextMenu and Menu are now one visual component that differ only in trigger behaviour (right-click/cursor-anchored vs. click/trigger-anchored).
- e3030d7: HoverCard now shares the Popover's Figma-aligned surface. The panel adopts `border-primary`, `space-03` (12px) padding, the Figma `shadow-strong`, and the 120ms enter/exit transition — replacing the older `border-data-entry` + two-layer shadow + 16px inset. The 320px preview max-width is unchanged.

  The pointer arrow has been removed: the `HoverCardArrow` export, the `HoverCardArrowProps` type, and the `showArrow` prop on `HoverCardContent` are gone. HoverCard and Popover are now one surface that differs only in trigger behaviour (hover/focus vs. click).

- 67687e1: Destructive menu items now use the destructive-ghost button's colors: coloured text at rest (`interactive-destructive-default-ghost`) that fills solid with light text on hover/press (`interactive-destructive-hover`/`-active` + `content-light`), replacing the previous error-message text with a tinted-background highlight. The leading icon inherits the item colour so it tracks through every state.
- af36060: Menu items now match the Figma spec: the label uses `body-medium` (14px) type and the leading icon is 20px (was `body-small`/12px). Also fixes `MenuCheckboxItem` so the check glyph actually renders when checked — the indicator was missing the `check` icon that the standalone `Checkbox` uses, so a checked item showed no mark.
- af36060: Update the `Meter` and `Progress` track background from `interactive-ui-default` to the theme-aware `interactive-secondary-default` overlay, following the design-token variable update (matches the `Avatar` fallback surface).
- 67687e1: Tag now matches the Figma tag component. Emphasized (solid) tags draw their label in `content-light` (Figma `content/light`, #fcfcfc) across every variant — previously success/info/info-secondary/error used `content-primary` (dark text) and caution used `content-inverse`, which rendered dark, theme-dependent labels on the solid status fills. Also dropped the non-Figma `letter-spacing` so the type tracking matches the design (0). Sizes, padding, radius, and subdued (tinted) styles were already correct and are unchanged.
- 67687e1: Align `Toast` with the Figma design: a 2px full border in the status colour (was a 1px neutral border with a 3px left accent), `surface-primary` background, `shadow-medium` (`0 4px 8px rgba(0,0,0,0.25)`), and a 320px width. The status icon is now 20px, the description uses `body-medium`/`content-primary` (was `body-small`/`content-secondary`) to match the title's size, and the close button is a 28px ghost square with a 20px icon.
- Updated dependencies [980ecf0]
- Updated dependencies [67687e1]
  - @ui-organized/schema@3.1.0
  - @ui-organized/tokens@3.1.0
  - @ui-organized/utils@3.1.0

## 3.0.0

### Major Changes

- 7fa8db2: consolidated text and icon color tokens to content tokens

### Patch Changes

- Updated dependencies [7fa8db2]
  - @ui-organized/schema@3.0.0
  - @ui-organized/tokens@3.0.0
  - @ui-organized/utils@3.0.0

## 2.1.0

### Minor Changes

- c7949c8: Code and design parity for additional components

### Patch Changes

- Updated dependencies [c7949c8]
  - @ui-organized/schema@2.1.0
  - @ui-organized/tokens@2.1.0
  - @ui-organized/utils@2.1.0

## 2.0.0

### Major Changes

- Migrate all component primitives from Base UI to Ark UI (`@ark-ui/react`). This is a breaking change: component APIs, prop names, and composition patterns have changed throughout the library. Review usage against the new Ark UI-based components when upgrading from 0.1.x.

### Patch Changes

- Updated dependencies
  - @ui-organized/schema@2.0.0
  - @ui-organized/tokens@2.0.0
  - @ui-organized/utils@2.0.0

## 0.1.1

### Patch Changes

- a6391a4: Theme builder fixes, default palette and palette updates, overview details, and Google Analytics integration.
- Updated dependencies [a6391a4]
  - @ui-organized/schema@0.1.1
  - @ui-organized/tokens@0.1.1
  - @ui-organized/utils@0.1.1
