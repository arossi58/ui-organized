# @ui-organized/react

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

- 978fa2f: New package: `@ui-organized/core`, the framework-neutral foundation the Svelte, Vue and Angular libraries will share with React.

  Most of this design system was never React. The component stylesheets are plain global CSS with BEM class names and `var(--token)` values, and every state style keys off the `data-*` attributes the headless layer emits — `[data-state]`, `[data-highlighted]`, `[data-disabled]`, `[data-invalid]` — which Zag emits identically in every framework it supports. The variant recipes are `cva` maps: pure functions from props to a class string. Between them that is roughly three quarters of the source, and none of it could be reached without depending on `@ui-organized/react`.

  So it moved: 66 stylesheets, 54 variant recipes, the control-size tables, Calendar's date arithmetic, Pagination's page-window algorithm, `OMIT_ARIA`/`popupControls`, and the tooling that derives the token contract from the CSS.

  **Nothing about the React package's public API changed.** The same 352 exports, the same props, the same rendered markup, and `@ui-organized/react/styles` still resolves to a stylesheet whose rules are byte-identical to the one 5.0.1 shipped. `@ui-organized/react/token-contract.json` still exists and still lists the same 136 tokens, because `@ui-organized/cli` reads that file out of an installed package at runtime.

  Two visible differences, neither of which should reach a consumer:
  - `class-variance-authority` is no longer a dependency of `@ui-organized/react` — the recipes that called it live in core now — and the ESM bundle is ~15% smaller as a result.
  - The `/* … */` source-path comments esbuild writes into `dist/index.css` now name the core package. The CSS rules either side of them are unchanged.

  Consumers who want the stylesheet without the React package can now take `@ui-organized/core/styles.css`, or one component at a time via `@ui-organized/core/components/Button/Button.css`.

- 93991ae: Fix: `Pagination`'s list items carried no spacing of their own, so any page that styles `li` pushed the page buttons off the line they shared with everything beside them.

  The row is a cluster of controls that happens to be marked up as a list — `.pagination__list` already zeroed the list's own margin and padding, but not the items'. A docs site, a CMS article, or any reset with list rhythm in it then added a bottom margin per `li` and one under the list, and the nav grew half a row taller than its buttons. In our own docs that read as a pagination row floating above the row count and the page-size select next to it, even though all three boxes were centred on the same line.

  `.pagination__list > li { margin: 0; padding: 0 }`. Nothing changes for a page that was not styling list items.

- **21 components new to `@ui-organized/react` since 5.1.0**, completing its coverage of Ark UI. Each one also ships in the Svelte, Vue and Angular libraries, with the same markup, ARIA and keyboard behaviour.
  - **Inputs:** `AngleSlider`, `ColorPicker`, `Editable`, `FileUpload`, `PinInput`, `RatingGroup`, `SignaturePad`, `TagsInput`
  - **Collections and structure:** `Carousel`, `Listbox`, `Marquee`, `Splitter`, `Steps`, `TreeView`
  - **Overlays:** `FloatingPanel`, `Tour`
  - **Display and utility:** `Clipboard`, `ImageCropper`, `QRCode`, `Timer`

  `Progress` gains `shape="circular"`, a ring with the same value, variants and states as the bar, sized to sit beside an avatar or inside a tile.

  **`DatePicker` ships deprecated.** Use `DateInput` for a single date or `DateRangeInput` for a range. `DatePicker` is no longer documented and will be removed in the next major release.

- 6eb40a7: Export `ToastOptions`.

  It is the argument to `toast.add()` — the whole imperative toast API — and was
  the one part of it a consumer could not name:

  ```ts
  import { useToastManager, type ToastOptions } from "@ui-organized/react";

  const SAVED: ToastOptions = { title: "Saved", type: "success" };
  ```

  Found by the cross-framework parity harness, which could not type a shared
  fixture: the Svelte and Vue packages have exported it since they were written.
  Additive only — no behaviour changes.

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
  - @ui-organized/tokens@3.5.0
  - @ui-organized/core@6.0.0

## 5.1.0

### Minor Changes

- eea54c1: Fix: every popper-positioned overlay computed `z-index: auto`. The whole `--z-index-*` scale was dead code for seven components, and a dropdown opened inside a `<Dialog>` rendered behind it.

  `@zag-js/popper` owns the positioner's stacking. It writes an inline `z-index: var(--z-index)` onto the positioner, then fills that variable by reading the popup:

  ```js
  // @zag-js/popper — get-placement.mjs
  floating.style.setProperty("--z-index", getComputedStyle(contentEl).zIndex);
  ```

  So the contract is _style the popup, the positioner inherits_. This package styled the positioner:

  ```css
  .select-positioner {
    z-index: var(--z-index-popover, 1000);
  } /* never applied */
  ```

  zag read `.select-popup`, which declared no `z-index`, hoisted `auto`, and its own inline style outranked the stylesheet rule. Nothing threw and the rule was right there in devtools — the only symptom was an overlay losing to a dialog. zag latches the read after the first open, so it never self-corrects on a later render either.

  The declaration moved to the popup in all eight affected components: `Select`, `Combobox`, `Menu`, `ContextMenu`, `Popover`, `HoverCard`, `Tooltip` and the date pickers' popover. `Dialog`, `Sheet` and `Toast` were never popper-positioned and were already correct — which is exactly why a dropdown-in-a-dialog was the case that surfaced this.

  **The stacking scale is reordered: anchored surfaces now outrank modal ones.**

  | Token               | Was    | Now    |
  | ------------------- | ------ | ------ |
  | `--z-index-dialog`  | `1100` | `1100` |
  | `--z-index-popover` | `1000` | `1200` |
  | `--z-index-tooltip` | `1200` | `1300` |
  | `--z-index-toast`   | `1300` | `1400` |

  Ranking popovers _below_ dialogs never described a real arrangement. An anchored surface is always spawned from something, and that something is often a dialog, so it has to paint over its own host. The previous order only looked correct because the values were inert.

  **If you layer your own overlays against these tokens, re-check them** — a fixed header at `1150` that used to clear every menu no longer does. Reference the tokens rather than the literals; both packages export the scale (`zIndexTokens`, `globalConstantVars()`).

  **If you patched this in app CSS**, the `!important` block on `[data-scope]` positioners was the only lever available — no component exposes a `zIndex` prop, and these elements portal to `document.body`, so there is no ancestor to scope to. It can be deleted. Leaving it in place is harmless; it just wins redundantly.

  **New regression gate:** `overlayStacking.test.ts` derives the popper-backed positioners from the rendered TSX and fails if any of them declares `z-index`, if any popup omits it, or if the tier order stops putting anchored surfaces above modal ones. A new anchored component has to be declared in it rather than silently inheriting the bug. The token-contract deriver now strips CSS comments too — prose that quotes `var(--z-index)` was otherwise entering the contract as a token every theme had to ship.

### Patch Changes

- Updated dependencies [eea54c1]
  - @ui-organized/tokens@3.4.0

## 5.0.1

### Patch Changes

- a013962: Fix: icon registration was tree-shaken out of every production build.

  `5.0.0` moved each icon library behind a subpath that registers itself by side effect:

  ```ts
  import "@ui-organized/react/icons/lucide"; // registerIconSet(lucideIcons)
  ```

  …while `package.json` declared `sideEffects: ["**/*.css"]`, which tells every bundler the JS in this package is pure. A side-effect-only import of a module the bundler believes is pure is exactly what tree shaking deletes, so the registration never ran and `<Icon>` rendered nothing — **in production builds only**. `vite dev` doesn't tree-shake, so development looked correct, and the build was green with no warning.

  Measured on a real app: 0 `<svg>` after `vite build`, 8 of 8 after the fix.

  `sideEffects` now exempts the icon modules, and stays narrow everywhere else so unused components still drop out:

  ```jsonc
  "sideEffects": ["**/*.css", "./dist/icons/*.mjs", "./dist/icons/*.js"]
  ```

  **The `<Icon>` warning now fires in production too.** It was dev-only, on the reasoning that a production problem should surface in development first. That reasoning failed in the one case that mattered: the bug existed _only_ in production, so the sole diagnostic was suppressed exactly where it was needed. Production now gets one short actionable line; the detailed guidance stays in development, and now mentions tree-shaking as a cause when icons work in dev but not in a build.

  **New release gate:** `examples/icon-smoke` is a minimal app using the documented setup and nothing else. The gate builds it for production, executes the built bundle under jsdom, and counts the `<svg>` elements it actually renders. Nothing cheaper works — unit tests import the module by name, which defeats tree shaking; `vite dev` never reproduces it; and grepping the bundle proves nothing because production output is minified. It builds its own dependency closure and needs no browser binaries, so it runs anywhere. In CI and in `pnpm release`.

## 5.0.0

### Major Changes

- 92af28d: **Breaking:** icon libraries now load through per-library subpaths. Add one import.

  ```diff
  + import "@ui-organized/react/icons/lucide";   // or /tabler, or /heroicons

    <IconProvider library="lucide" style="outline">
  ```

  That is the whole migration. Everything else about `IconProvider` and `<Icon>` is unchanged, and forgetting it is loud rather than silent — `<Icon>` renders nothing and logs the exact line to add.

  **Why it had to break.** All three icon libraries were declared optional peers, but `dist/index.mjs` imported all three with static top-level `import` statements. `optional` only suppresses npm's install-time warning; at bundle time every one of them was a hard requirement. An app that used only Lucide, with only Lucide installed, failed its production build with 168 errors:

  ```
  [MISSING_EXPORT] "IconArrowDown" is not exported by
  "__vite-optional-peer-dep:@tabler/icons-react:@ui-organized/react"
  ```

  …for a library it never referenced. The alternative fixes were worse: declaring all three as hard peers means 96 MB of icon packages in every install, and lazy `import()` would make the most common element in the system render a frame late.

  Now the main entry imports no icon library at all. Each library lives behind its own subpath, which is the only module that touches it, so the ones you don't import are never resolved — not at install, not at build. `<Icon>` stays synchronous.

  Also in this release:
  - `IconProvider` accepts an `icons` prop, if you'd rather pass the set explicitly than rely on an import side effect: `import { lucideIcons } from "@ui-organized/react/icons/lucide"`.
  - **`render`-prop triggers no longer discard `children`.** `<PopoverTrigger render={<Button icon="plus" />}>Add item</PopoverTrigger>` silently dropped "Add item", giving an icon-only button with no label and no warning. Children are now projected into the rendered element; when that element already has its own children the combination is ambiguous, so the library keeps its children and warns in development. Fixed at all nine sites — Dialog, AlertDialog, Popover, Menu, HoverCard and Sheet triggers and closes.
  - `IconProvider`'s context value is memoised, so it no longer re-renders every `<Icon>` in the tree on each parent render.

## 4.2.0

### Minor Changes

- 7b759c8: Fix theming setup: a generated theme is now complete by construction, and the library degrades gracefully when one isn't.

  **`@ui-organized/react`**
  - `@ui-organized/react/styles.css` now resolves. It was never an exports subpath, so the spelling most people type — and the one the Theme Builder's own instructions shipped — failed the build on the first line. Both `/styles` and `/styles.css` are exported, and both carry TypeScript types, so consumers no longer need a `declare module` shim.
  - Component styles reference the non-themeable layout constants with fallbacks (`var(--z-index-popover, 1000)`, `var(--dimension-06, 240px)`). A theme that omits them used to fail silently — green build, clean console, sidebar shrunk to fit its content and every portalled overlay stacking on DOM order alone.
  - Ships `token-contract.json`, importable as `@ui-organized/react/token-contract.json`: the generated list of all 122 custom properties the components consume but don't define. Derived from the component CSS, so it can't drift from the library — use it to check a theme is complete.

  **`@ui-organized/tokens`**
  - New typed exports `dimensionTokens`, `zIndexTokens` and `globalConstantVars()`. The z-index scale used to be a string literal appended to `variables.css` after the build, which made it unimportable — and that is precisely why theme generators dropped it. It is now a DTCG source file like every other token.

  **`@ui-organized/export`**
  - `exportCss` backfills the layout constants for any document that doesn't define them. A document that does keeps its own values.

### Patch Changes

- 7b759c8: ScrollArea: a Root bounded by `max-height` rather than a fixed `height` now scrolls instead of clipping. The viewport inherits the Root's cap, so `<ScrollArea style={{ maxHeight: 320 }}>` behaves like the fixed-height form once the content outgrows it, and is unchanged when neither is set.
- Updated dependencies [7b759c8]
  - @ui-organized/tokens@3.3.0

## 4.1.0

### Minor Changes

- b616cc8: Remove build-time and unused packages from the published runtime dependency tree.

  `style-dictionary` is a build-time-only tool and is now a devDependency of `@ui-organized/tokens`; it was previously installed by every consumer of `@ui-organized/react`. Also drops the unused `@ui-organized/schema` dependency from `@ui-organized/utils` and `@ui-organized/react`.

  No API changes. Consumer install drops from ~253 packages to ~96.

### Patch Changes

- Updated dependencies [b616cc8]
  - @ui-organized/tokens@3.2.0
  - @ui-organized/utils@3.2.0

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

- 67687e1: ContextMenu now matches the Figma menu surface and the Menu component 1:1. Aligned the popup surface (`border-primary` + Figma `shadow-strong`), item type scale (`body-medium`, 20px leading icon), destructive items (destructive-ghost fill on hover/press with light text), group-label color (`content-primary`), and the separator (now the shared `<Divider>`). Checkbox items render the same check-glyph as the standalone Checkbox. ContextMenu and Menu are now one visual component that differ only in trigger behaviour (right-click/cursor-anchored vs. click/trigger-anchored).
- e3030d7: HoverCard now shares the Popover's Figma-aligned surface. The panel adopts `border-primary`, `space-03` (12px) padding, the Figma `shadow-strong`, and the 120ms enter/exit transition — replacing the older `border-data-entry` + two-layer shadow + 16px inset. The 320px preview max-width is unchanged.

  The pointer arrow has been removed: the `HoverCardArrow` export, the `HoverCardArrowProps` type, and the `showArrow` prop on `HoverCardContent` are gone. HoverCard and Popover are now one surface that differs only in trigger behaviour (hover/focus vs. click).

- 67687e1: Destructive menu items now use the destructive-ghost button's colors: colored text at rest (`interactive-destructive-default-ghost`) that fills solid with light text on hover/press (`interactive-destructive-hover`/`-active` + `content-light`), replacing the previous error-message text with a tinted-background highlight. The leading icon inherits the item color so it tracks through every state.
- af36060: Menu items now match the Figma spec: the label uses `body-medium` (14px) type and the leading icon is 20px (was `body-small`/12px). Also fixes `MenuCheckboxItem` so the check glyph actually renders when checked — the indicator was missing the `check` icon that the standalone `Checkbox` uses, so a checked item showed no mark.
- af36060: Update the `Meter` and `Progress` track background from `interactive-ui-default` to the theme-aware `interactive-secondary-default` overlay, following the design-token variable update (matches the `Avatar` fallback surface).
- 67687e1: Tag now matches the Figma tag component. Emphasized (solid) tags draw their label in `content-light` (Figma `content/light`, #fcfcfc) across every variant — previously success/info/info-secondary/error used `content-primary` (dark text) and caution used `content-inverse`, which rendered dark, theme-dependent labels on the solid status fills. Also dropped the non-Figma `letter-spacing` so the type tracking matches the design (0). Sizes, padding, radius, and subdued (tinted) styles were already correct and are unchanged.
- 67687e1: Align `Toast` with the Figma design: a 2px full border in the status color (was a 1px neutral border with a 3px left accent), `surface-primary` background, `shadow-medium` (`0 4px 8px rgba(0,0,0,0.25)`), and a 320px width. The status icon is now 20px, the description uses `body-medium`/`content-primary` (was `body-small`/`content-secondary`) to match the title's size, and the close button is a 28px ghost square with a 20px icon.
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
