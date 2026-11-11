# @ui-organized/utils

## 4.0.0

### Major Changes

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

### Minor Changes

- **Dark mode: the primary and secondary surfaces trade places, and so do the primary and secondary borders.** Light mode is unchanged.

  | Token                       | Was         | Now         |
  | --------------------------- | ----------- | ----------- |
  | `--color-surface-primary`   | `grey.2300` | `grey.2200` |
  | `--color-surface-secondary` | `grey.2200` | `grey.2300` |
  | `--color-border-primary`    | `grey.2100` | `grey.2000` |
  | `--color-border-secondary`  | `grey.2000` | `grey.2100` |

  Dark mode had both pairs the opposite way round from light. In light mode the primary surface is the one furthest from the page, with secondary between them, and the primary border is the stronger hairline. Dark mode now orders them the same way, so a card on `--color-surface-primary` lifts off the page in both modes, and a layout that relies on the difference reads the same after a theme switch. The `semanticColorMap` in `@ui-organized/utils` carries the same change, so themes resolved through `resolveSemanticColors` follow it.

## 3.2.0

### Minor Changes

- b616cc8: Remove build-time and unused packages from the published runtime dependency tree.

  `style-dictionary` is a build-time-only tool and is now a devDependency of `@ui-organized/tokens`; it was previously installed by every consumer of `@ui-organized/react`. Also drops the unused `@ui-organized/schema` dependency from `@ui-organized/utils` and `@ui-organized/react`.

  No API changes. Consumer install drops from ~253 packages to ~96.

## 3.1.0

### Minor Changes

- 980ecf0: Styling updates

### Patch Changes

- 67687e1: Remap the semantic status colors (`success`, `info`, `info-secondary`, `caution`, `error`) to new primitive shades from the theme-builder export, in both the shipped token pipeline and the theme builder's resolver. Dark base now uses the `1700`/`2000`/`300` shade pattern and light uses `1500`/`600`/`2100`; `error-message` is unchanged. The `warning` (cerise) tokens are untouched.
- Updated dependencies [980ecf0]
  - @ui-organized/schema@3.1.0

## 3.0.0

### Major Changes

- 7fa8db2: consolidated text and icon color tokens to content tokens

### Patch Changes

- Updated dependencies [7fa8db2]
  - @ui-organized/schema@3.0.0

## 2.1.0

### Minor Changes

- c7949c8: Code and design parity for additional components

### Patch Changes

- Updated dependencies [c7949c8]
  - @ui-organized/schema@2.1.0

## 2.0.0

### Major Changes

- Released as part of the unified ui-organized 2.0.0 line. Versions are aligned across the `@ui-organized/*` suite for the Ark UI migration; use matching 2.x versions of all `@ui-organized/*` packages together.

### Patch Changes

- Updated dependencies
  - @ui-organized/schema@2.0.0

## 0.1.1

### Patch Changes

- a6391a4: Theme builder fixes, default palette and palette updates, overview details, and Google Analytics integration.
- Updated dependencies [a6391a4]
  - @ui-organized/schema@0.1.1
