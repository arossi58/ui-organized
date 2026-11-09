---
"@ui-organized/utils": major
"@ui-organized/core": major
"@ui-organized/react": major
"@ui-organized/svelte": major
"@ui-organized/vue": major
"@ui-organized/angular": major
"@ui-organized/react-table": major
"@ui-organized/vue-table": major
"@ui-organized/svelte-table": major
"@ui-organized/angular-table": major
---

**Icons use your icon library's own names. Nothing is renamed any more.**

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

| Was | Lucide |
| --- | --- |
| `close` | `x` |
| `edit` | `pencil` |
| `trash` | `trash-2` |
| `refresh` | `refresh-cw` |
| `undo` / `redo` | `undo-2` / `redo-2` |
| `check-circle` | `circle-check-big` |
| `alert-circle` | `circle-alert` |
| `alert-triangle` | `triangle-alert` |
| `loader` | `loader-circle` |
| `home` | `house` |
| `grid` | `grid-2x2` |
| `unlock` | `lock-open` |
| `sort-asc` / `sort-desc` | `arrow-up-a-z` / `arrow-down-a-z` |
| `sort` | `list-filter` |

Names such as `check`, `plus`, `search` and `chevron-down` are already Lucide's own and need only registering. For Tabler and Heroicons, use the names on tabler.io and heroicons.com.

### Removed

- `CANONICAL_ICON_NAMES`, `CanonicalIconName`, `ICON_MAP`, `IconLibraryNames` and `resolveIconName` from `@ui-organized/utils`.
- `resolveIconComponent` from `@ui-organized/core`. `IconSet.outline` and `IconSet.solid` now hold only the components' own icons.

### Added

- `registerIcons` from each `icons/<library>` subpath, and `registerLibraryIcons(library, icons)` from the main entry for setups that pass `icons` explicitly.
- `IconName` type, and `toNativeName(library, exportName)`, which shows the name an export registers under.
- React, Vue and Svelte: `Menu`, `ContextMenu`, `Toggle`, `SegmentedControl`, `Breadcrumb`, `TreeView` and `Navigation` `icon` props accept a component as well as a name, as `Button` and `Tag` already did.
- React: `useIconConfig` is exported.
