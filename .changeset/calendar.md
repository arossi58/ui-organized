---
"@ui-organized/core": minor
"@ui-organized/react": minor
"@ui-organized/svelte": minor
"@ui-organized/vue": minor
"@ui-organized/angular": minor
---

Calendar is exported, with presets; DateRangeInput takes presets too.

- **`Calendar`.** A month grid on its own.
  - **Values:** ISO `YYYY-MM-DD` strings, as on DateInput and DateRangeInput. `mode` is `single` (the default) or `range` (a `DateRangeValue`).
  - **Props:** `min`, `max`, `numMonths`, `weekStartsOn`, `variant` (`plain` or `card`) and a `footer` for actions such as Cancel and Apply.
  - **Angular:** `div[uioCalendar]`, with separate `value` and `range` models and a `[uioCalendarFooter]` row.
- **`presets`.** A column of shortcuts before the grid.
  - **Values:** a fixed date, a fixed range, or a name resolved against today: `today`, `yesterday`, `last7Days`, `last30Days`, `thisWeek`, `lastWeek`, `thisMonth`, `lastMonth`, `thisQuarter`, `lastQuarter`, `thisYear`, `lastYear` and the other `last…Days`.
  - **Behaviour:** each preset is a toggle button, pressed while the selection is exactly its range. A preset outside `min`/`max` is disabled. Picking one moves the view to its month.
- **DateRangeInput.** It takes the same `presets`. Picking one fills both ends and closes the popover.
- **Core.** `resolveDatePreset`, `presetWithin`, `startOfWeek` and `endOfMonth` are exported.
- **Internal rename.** The day grid DateInput, DateTimeInput and DateRangeInput are built on is now `CalendarGrid`. It is still internal, and its DOM is unchanged.
