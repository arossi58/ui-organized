# @ui-organized/svelte

## 6.1.0

### Patch Changes

- @ui-organized/core@6.1.0

## 6.0.0

### Major Changes

- 83201b5: **Icons use your icon library's own names. Nothing is renamed any more.**

  `<Icon name>` and every `icon` prop now take the name the icon library publishes: `x` and `trash-2` in Lucide, `x-mark` and `trash` in Heroicons. The design system's own vocabulary of 62 renamed icons (`close`, `edit`, `alert-circle` and so on) is gone, along with the 62-icon ceiling it put on what you could name.

  Register the icons you use, once, from the library's subpath. Only what you register reaches your bundle:

  ```ts
  import { registerIcons } from "@ui-organized/react/icons/lucide";
  import { ChevronDown, Trash2, X } from "lucide-react";

  registerIcons({ ChevronDown, Trash2, X }); // "chevron-down", "trash-2", "x"
  ```

  The name is read off the export. The few exports whose digits can't be read back unambiguously, such as `ArrowDown01` (`arrow-down-0-1`), are registered by name instead: `registerIcons({ "arrow-down-0-1": ArrowDown01 })`. Passing a component directly (`<Icon name={X} />`) still works and needs no registration.

  **What doesn't change:** the components' own icons, such as a dialog's close button, a select's chevron or an alert's status icon. They come from the subpath import as before and still follow `IconProvider library`, with no registration.

  **What does change when you switch library:** your own names don't translate, because each belongs to the library you took it from. Register the new library's icons and use its names.

  An unregistered name renders nothing and, in development, logs the names that are registered.

  ### Migrating

  Replace each old name with your library's own. The common ones in Lucide (as `lucide-react@0.x` names them):

  | Was                      | Lucide                            |
  | ------------------------ | --------------------------------- |
  | `close`                  | `x`                               |
  | `edit`                   | `pencil`                          |
  | `trash`                  | `trash-2`                         |
  | `refresh`                | `refresh-cw`                      |
  | `undo` / `redo`          | `undo-2` / `redo-2`               |
  | `check-circle`           | `circle-check-big`                |
  | `alert-circle`           | `circle-alert`                    |
  | `alert-triangle`         | `triangle-alert`                  |
  | `loader`                 | `loader-circle`                   |
  | `home`                   | `house`                           |
  | `grid`                   | `grid-2x2`                        |
  | `unlock`                 | `lock-open`                       |
  | `sort-asc` / `sort-desc` | `arrow-up-a-z` / `arrow-down-a-z` |
  | `sort`                   | `list-filter`                     |

  Names such as `check`, `plus`, `search` and `chevron-down` are already Lucide's own and need only registering. For Tabler and Heroicons, use the names on tabler.io and heroicons.com.

  ### Removed
  - `CANONICAL_ICON_NAMES`, `CanonicalIconName`, `ICON_MAP`, `IconLibraryNames` and `resolveIconName` from `@ui-organized/utils`.
  - `resolveIconComponent` from `@ui-organized/core`. `IconSet.outline` and `IconSet.solid` now hold only the components' own icons.

  ### Added
  - `registerIcons` from each `icons/<library>` subpath, and `registerLibraryIcons(library, icons)` from the main entry for setups that pass `icons` explicitly.
  - `IconName` type, and `toNativeName(library, exportName)`, which shows the name an export registers under.
  - React, Vue and Svelte: `Menu`, `ContextMenu`, `Toggle`, `SegmentedControl`, `Breadcrumb`, `TreeView` and `Navigation` `icon` props accept a component as well as a name, as `Button` and `Tag` already did.
  - React: `useIconConfig` is exported.

- 83201b5: Tag: remove the `warning` variant. It duplicated `caution` in purpose and was the only Tag colour with no counterpart in the Figma library. Use `caution` instead. Alert, Meter and Progress keep their `warning` variants.
- 2a6ea22: **Ten packages move to one version line at 6.0.0.**

  Nine of them have never been published. The tenth, `@ui-organized/react`, was at 5.1.0 and is the reason the shared line starts at 6: a group cannot go backwards, so it takes the highest version in it and moves up together.

  **This is a renumbering, not a breakage — and it is worth being exact about that.** `@ui-organized/react`'s public API is unchanged: nothing was removed from its barrel (96 export lines became 140), its `exports` map is byte-identical, and its peer dependencies are untouched. The only change to its manifest is internal — it now depends on `@ui-organized/core` instead of `class-variance-authority`. If you are upgrading from 5.1.0 and only use `@ui-organized/react`, there is no migration: install, and the same imports resolve to the same things.

  The reason for the major is that **the design system stopped being one library.** Ten packages that ship together and depend on each other by exact version are much easier to reason about on one line than on ten, and the alternative — `react` at 5.2.0 beside `core` at 0.2.0 and `react-table` at 1.0.0 — makes "which versions go together" a question every consumer has to answer from a changelog.

  **What is actually new.** `@ui-organized/core` holds the CSS, the style recipes and the token contract, and the four framework libraries render against it: `@ui-organized/react`, `@ui-organized/svelte`, `@ui-organized/vue` and `@ui-organized/angular`, each with the same 68 components. The data table ships as an engine (`@ui-organized/table-core`) plus one adapter per framework. Every one of those is checked against React's DOM by a parity harness rather than asserted — the four libraries render the same markup, carry the same ARIA and answer the same keys, and the gates that prove it run on every commit.

  `@ui-organized/core` is a **dependency** of each framework library, not a peer, so nobody has a new install step and no import path changed. `@ui-organized/tokens` and `@ui-organized/utils` keep their own version lines: they are consumed by things outside this group.

### Minor Changes

- e6613d2: **Semantic colour roles now hold WCAG AA for every brand × neutral × mode.** Colour values move in this release **because the old ones failed AA**. If you colour-matched against the previous output, expect differences in the places listed below.

  A new regression test resolves all 572 combinations (26 brands × 11 neutrals × 2 modes) and checks each text, link, button-label and focus pair against its WCAG floor. `pnpm audit:contrast` prints the same audit.

  **`@ui-organized/utils`**
  - `getCoreFamily(name)` now returns the **derived** ramp for neutral families, re-lightened to match grey step for step. The authored tinted neutrals differ from grey by up to 23 L\* mid-ramp, and 19 of 33 dark-mode text pairs failed on them. The authored ramps are still available through the new `getAuthoredFamily(name)`, for palette display.
  - `resolveSemanticColors` / `resolveSemanticRefs` choose three roles by contrast instead of using a fixed step:
    - `--color-interactive-contents` (the filled-button label) is near-black on light brand fills. 13 of 26 brands, including candlelight at 1.99:1, used to get a white label.
    - Primary fill states walk the ramp away from the label when they would fail with it.
    - Link states (`--color-interactive-tertiary-{default,hover,active}`) walk the ramp until they clear 4.5:1 on both surfaces, and stay on distinct steps.
  - An unresolvable ref now **throws** instead of being written into CSS as `"grey.2400"`. `getNeutralPreset()` ramps are 16-step pack presets and are not valid input to the resolver.
  - New exports: `getAuthoredFamily`, `contrastRatio`, `relativeLuminance`, and `pickPrimaryLabel` (the label the resolver puts on a given primary fill, for shade pickers). Both theme builders now judge primary shades by that label, so light brands keep their own 1400 with a dark label instead of being forced to a dark shade.

  **`@ui-organized/tokens`**
  - Default theme: `--color-interactive-primary-active` → `brand.1500` in both modes (the label on the pressed fill was 4.15:1). Light `--color-interactive-tertiary-active` → `brand.1700`. Dark `--color-interactive-tertiary-hover` → `brand.1200` (it was 2.35:1, darker than the page) and dark `-active` → `brand.1000`.
  - `initTheme()` no longer writes to storage on load, and it follows the OS until an explicit `setTheme` or `toggleTheme`. `setTheme("system")` returns to following the OS. A browser reporting `no-preference` now resolves to **light** (it used to resolve to dark). The fallback can be set with `initTheme({ fallback })` or positionally as before.
  - Overlay tokens (`--color-interactive-ui-*`, `-secondary-*`, `-ghost-*`) document their alpha at the point of definition and in the README.

  **Components**
  - Focus rings are drawn with `outline`, not `box-shadow`, in every component. A consumer `box-shadow` no longer erases the focus indicator, and the ring now shows in forced-colors mode.
  - Button hover and press rules are wrapped in `:where()`, so one consumer class restyles every state.
  - New icons for theme toggles: `sun`, `moon` and `monitor`.

- 4bfb23a: **ColorPicker: the popup's notation row, redrawn to the design — and given to all four libraries.**

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

- ea1ac9e: First release of `@ui-organized/svelte`: the design system's components for Svelte 5, built on Ark UI.

  **All 68 components** the React package ships, sharing its stylesheets, variant recipes and token contract through `@ui-organized/core`. Same class names, same `data-*` state attributes, same rendered ARIA, verified by a gate that renders every library and diffs the resulting DOM — 1,812 static comparisons and 848 in a browser, on every run.

  Where Svelte idiom and API parity pulled in different directions, both are supported rather than one being chosen: controlled props (`value`, `open`, `checked`) are `$bindable`, so `bind:value` works, and the `onValueChange`-style callbacks the React package exposes fire alongside them.

  Two deliberate divergences, both documented on the components:
  - Polymorphic rendering is `asChild` — a snippet receiving the props to spread — rather than React's `render` prop, matching Ark's own Svelte convention so a ui-organized Button composes with an Ark trigger the way an Ark part does. `Button`'s `asChild` also receives the button's content, since that content is the icon and the label in the order `iconPosition` asks for, not just `children`.
  - `Tooltip` always renders an Ark trigger. React inspects its children with `isValidElement` and projects onto a single element child; a Svelte snippet is opaque and cannot be asked whether it renders one element.

  Component stylesheets are imported per component, so an app that uses three ships three. `@ui-organized/svelte/styles` is there for consumers who would rather take the lot at once.

  Published at `0.1.0` while the remaining components are ported.

- 93991ae: Fix: `Pagination`'s list items carried no spacing of their own, so any page that styles `li` pushed the page buttons off the line they shared with everything beside them.

  The row is a cluster of controls that happens to be marked up as a list — `.pagination__list` already zeroed the list's own margin and padding, but not the items'. A docs site, a CMS article, or any reset with list rhythm in it then added a bottom margin per `li` and one under the list, and the nav grew half a row taller than its buttons. In our own docs that read as a pagination row floating above the row count and the page-size select next to it, even though all three boxes were centred on the same line.

  `.pagination__list > li { margin: 0; padding: 0 }`. Nothing changes for a page that was not styling list items.

- 63cc837: **New: `Chip`**, a compact token standing for something the user _added_ (a filter, a facet, a recipient), in all four libraries.

  ```tsx
  <Chip label="Role" operator="is any of" value="Owner, Admin" />
  <Chip label="Team" value="Design" onRemove={drop} removeLabel="Remove team: Design" />
  ```

  It is not a variant of `Tag`, and the difference is worth stating: a `Tag` reports status the user did not choose and is a non-focusable `<span>`; a `Chip` stands for something the user can edit or remove.

  **A chip reads as a short sentence, in segments.** `label` names the thing, `operator` is the relation ("is any of", "is before", "is greater than") and `value` is the value. Only the value truncates: losing the end of "Admin, Owner" still reads, losing the end of "Role" does not. Every relation is spelled out in words, so the chip reads the same whether it is seen or heard.

  **Each segment can be its own control.** The shorthand props render static segments. For a chip whose parts each open something, compose `ChipSegment`s as children and project each one into its own menu or popover trigger:

  ```tsx
  <Chip selected onRemove={remove} removeLabel="Remove filter: Name">
    <ChipSegment part="label" onClick={openFields}>
      Name
    </ChipSegment>
    <ChipSegment part="operator" onClick={openOperators}>
      is greater than
    </ChipSegment>
    <ChipSegment onClick={openValue}>10</ChipSegment>
  </Chip>
  ```

  That is the structural decision the component exists to hold. The segments and the dismiss button are **siblings** inside a `<span role="group">`, never nested, because a button within a button is invalid HTML and an axe `nested-interactive` violation; the wrapper is what makes several controls look like one object. A chip that opens nothing renders `<span>` segments rather than buttons, so a list of static tokens does not become a list of empty tab stops.

  Also:
  - **`selected`** (one of its menus is open, or it is toggled on) and **`incomplete`** (it does not yet stand for anything; dashed, because it is an invitation and not an error).
  - **`disabled`** disables every segment, including ones you composed, and the dismiss button.
  - `removeLabel` is the dismiss button's whole accessible name, and the component warns in development when `onRemove` is set without one: a row of chips whose buttons all say "Remove" gives assistive tech six identical controls.
  - Angular spells it `<span uioChip>` with `button[uioChipSegment]` / `span[uioChipSegment]` parts, and a `removable` input with a `(remove)` output in place of `onRemove`.
  - `@ui-organized/core` exports the recipes, `chipStyles` and `chipSegmentStyles`, and the `ChipSegmentPart` type.

  No new tokens: the chip is drawn from the interactive, content and border colours and the spacing scale that every theme already supplies.

### Patch Changes

- **Clicking a control no longer draws the keyboard focus ring.**

  Browsers match `:focus-visible` on every focus of a text field, mouse included, so CSS alone cannot tell a click from a Tab. The text fields now tell them apart. After a click, the field's border takes the focus colour; after Tab, the full ring is drawn as before. This covers `Input`, `TextArea`, `PasswordInput`, `SearchInput`, `NumberField`, `PinInput`, `TagsInput`, `Editable`, `Combobox`, `DateInput`, `DateTimeInput` and `DateRangeInput`. An invalid field keeps its error colour either way.

  The tracking is a new entry point, `@ui-organized/core/focus-modality`. It records `data-focus-modality="pointer" | "keyboard"` on `<html>`, and the fields start it on mount, so you need do nothing. Typing into a field you clicked still counts as pointer use: only Tab, or keys pressed outside a text field, switch to keyboard. A page that never mounts a text field never installs it and keeps the full ring everywhere. To read the same state for your own controls, call `trackFocusModality()`. `FOCUS_MODALITY_ATTRIBUTE` and the `FocusModality` type are exported beside it.

  `Checkbox`, `Radio`, `Switch` and `SegmentedControl` stop showing a ring after a click too. Zag marks their hidden input as focus-visible when a `<label>` forwards a click to it, so the ring now also requires the browser's own `:focus-visible`, which is false for pointer focus.

  Also:
  - **Closed overlays are removed from layout and from the accessibility tree.** Ark keeps a closed part mounted and hides it with `hidden`, and a component's own `display` rule was overriding that. Closed `Dialog`, `AlertDialog`, `Sheet`, `Select`, `Combobox`, `ColorPicker`, `DatePicker`, `Tour` and `FloatingPanel` content stayed reachable by keyboard and screen reader, a collapsed `TreeView` branch still exposed its children, every `Listbox` option showed a checkmark, and a hidden `Button` stayed clickable. `[hidden]` is now restored once, for every component, in the base stylesheet.
  - `Dialog`'s backdrop fades in rather than appearing at full strength on its first frame.
  - The destructive `Button` always takes a light label. `--color-interactive-contents` is derived from the brand fill and turns dark on a light brand, but the crimson destructive fill never changes with the brand.
  - An indeterminate `Checkbox` shows its dash. It was rendering an empty box.
  - `Switch` contains its hidden input, as `Checkbox` and `Radio` do. Focusing a switch inside a scrolled panel no longer scrolls that panel.
  - `SegmentedControl`'s track is a wash (`--color-surface-overlay-primary`) instead of a fill, so it reads as a well on any surface.
  - `Listbox` (React, Svelte and Vue): pressing an option inside a scrolled container no longer scrolls the list's top into view between press and release, which made the tap select the wrong option, or nothing.

- Updated dependencies [e6613d2]
- Updated dependencies [4bfb23a]
- Updated dependencies
- Updated dependencies [83201b5]
- Updated dependencies [978fa2f]
- Updated dependencies [93991ae]
- Updated dependencies
- Updated dependencies [83201b5]
- Updated dependencies [2a6ea22]
- Updated dependencies [63cc837]
  - @ui-organized/utils@4.0.0
  - @ui-organized/core@6.0.0
