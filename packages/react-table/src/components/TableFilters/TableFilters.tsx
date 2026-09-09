import { useEffect, useRef, useState } from "react";
import { clsx } from "clsx";
import {
  Button,
  Chip,
  Divider,
  Menu,
  MenuContent,
  MenuItem,
  MenuTrigger,
  Popover,
  PopoverContent,
  PopoverTitle,
  PopoverTrigger,
  Select,
} from "@ui-organized/react";
import type { ComparisonIconName } from "@ui-organized/react";
import type { TableFilterCondition } from "@ui-organized/table-core";
import { useTableContext } from "../../core/TableContext.js";
import { TableFilterValueEditor } from "./TableFilterValue.js";
import { useAutoFocusField } from "./useAutoFocusField.js";
import type {
  TableFilterAddProps,
  TableFilterChipProps,
  TableFilterEditorProps,
  TableFiltersProps,
} from "./TableFilters.types.js";

/**
 * The applied filters, on their own line under the header (Figma 2298:362).
 *
 * A *summary*, not a control panel: the filter button lives in the header
 * above, and this line does not exist until the user has actually filtered
 * something. A bar that is always present and usually empty is chrome that
 * teaches people to stop looking at it.
 */
export function TableFilters({ className }: TableFiltersProps) {
  const { filters, options } = useTableContext();

  if (options.filterable === false) return null;
  if (filters.conditions.length === 0) return null;

  return (
    // `role="group"`, not `role="toolbar"`: toolbar promises arrow-key
    // navigation between its controls, and until that lands the promise would
    // be a lie to assistive tech.
    <div className={clsx("data-table__filters", className)} role="group" aria-label="Filters">
      <span className="data-table__filters-label">Filters</span>

      {filters.conditions.map((condition) => (
        <TableFilterChip key={condition.id} condition={condition} />
      ))}

      <TableFilterAdd label="Add" />

      <Button intent="ghost" size="sm" icon="rotate-ccw" onClick={filters.clear}>
        Reset
      </Button>

      {/* One polite region for add / remove / change / clear. Deliberately not
          a visible count: that changes on every keystroke elsewhere, and a live
          region that re-announces per keystroke is a firehose. */}
      <span className="data-table__sr-only" role="status" aria-live="polite">
        {filters.announcement}
      </span>
    </div>
  );
}

// ─── Add filter ──────────────────────────────────────────────────────────────

/**
 * The field picker, in both the shapes the design uses it: the header's
 * icon-only button (Figma 2298:336) and the filter bar's "＋ Add" (2298:531).
 *
 * A `Menu`, like every other menu the table puts in its chrome
 * (`TableViewOptions`, `TableExportMenu`, `TableRowActions`). Picking a field
 * *does* something — it adds a filter and opens that filter's editor — so
 * `role="menu"` with `menuitem` children is the honest semantic. The earlier
 * `Listbox` had to be held at a permanently-empty selection to stop it
 * behaving like one, which is a sign the role was wrong.
 *
 * No search box: a text input inside `role="menu"` breaks the menu's own
 * keyboard contract, and zag's menu already does typeahead (printable
 * characters jump to a matching item, on by default), which is the same
 * affordance without the semantic damage.
 */
export function TableFilterAdd({
  label = "Add filter",
  iconOnly = false,
  className,
}: TableFilterAddProps) {
  const { filters, size } = useTableContext();
  if (filters.fields.length === 0) return null;

  // The two presentations are the two places this appears, not a free choice:
  // the header's is the funnel that *starts* filtering, the bar's is the plus
  // that adds another to a list that already exists.
  // `aria-label` on the trigger also names the menu it opens: zag points the
  // menu's `aria-labelledby` at its trigger, which wins over any `aria-label`
  // set on the content. So the button's name has to be the *menu's* name too —
  // "Add filter", not "Filter".
  const trigger = iconOnly ? (
    <Button intent="secondary" size={size} icon="filter" aria-label={label} className={className} />
  ) : (
    <Button intent="ghost" size="sm" icon="plus" className={className}>
      {label}
    </Button>
  );

  return (
    <Menu>
      <MenuTrigger render={trigger} />
      <MenuContent align="end" className="data-table__filter-picker">
        {filters.fields.map((field) => (
          <MenuItem
            key={field.columnId}
            value={field.columnId}
            // A field that already carries conditions stays in the list —
            // several conditions on one column is the point — with a count so
            // it is obvious this adds another rather than replacing.
            onSelect={() => filters.add(field.columnId)}
          >
            {field.count > 0 ? `${field.label} (${field.count})` : field.label}
          </MenuItem>
        ))}
      </MenuContent>
    </Menu>
  );
}

// ─── Chip ────────────────────────────────────────────────────────────────────

/**
 * One condition, as a chip that opens its own editor (Figma 2298:376).
 *
 * No dismiss button on the chip itself: removal lives inside the editor, where
 * the design puts it. That keeps the chip a single target the whole width of
 * the words it shows — a 20px-tall pill with a second 20px hit area inside it
 * is a coin-flip on touch.
 */
export function TableFilterChip({ condition, className }: TableFilterChipProps) {
  const { filters } = useTableContext();
  // Which chip is open is filter state, not chip state: the chip that opens is
  // often the one the *header* just created, and removing an open condition has
  // to close its editor rather than leave a dangling id behind.
  const open = filters.editing === condition.id;
  const setOpen = (next: boolean) => filters.setEditing(next ? condition.id : null);

  // The condition as it was when the editor opened, so Escape can revert it.
  const snapshot = useRef<TableFilterCondition | null>(null);
  const [editorEl, setEditorEl] = useState<HTMLDivElement | null>(null);
  useAutoFocusField(editorEl, open);

  useEffect(() => {
    if (open) snapshot.current = condition;
    // Only when the editor opens — capturing on every change would defeat it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const description = filters.describe(condition);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          // The design system `Chip`. Every prop but `className` lands on its
          // body, so the trigger's `id`, `onClick` and `aria-expanded` attach
          // to the button that opens the popover rather than to a wrapper.
          //
          // Left at its default size, whatever the table's density: `md` is the
          // size Figma draws a filter chip at, and these describe the table
          // rather than being part of it — a row of 40px chips would outweigh
          // the header it sits under.
          <Chip
            className={clsx("data-table__filter-chip", className)}
            label={description.field}
            // Six operators are drawn rather than spelled (Figma 2298:857 …
            // 2298:948); the rest keep their words. `relative` stays the
            // glyph's accessible name either way, so "Name contains ada" is
            // what a screen reader hears in both cases.
            operator={description.icon as ComparisonIconName | undefined}
            operatorLabel={description.relative}
            detail={description.relative}
            selected={open}
            incomplete={!description.complete}
            data-column-id={condition.columnId}
            data-filter-id={condition.id}
          >
            {description.value}
          </Chip>
        }
      />
      <PopoverContent
        className="data-table__filter-editor-popup"
        side="bottom"
        align="start"
        onKeyDown={(event) => {
          if (event.key !== "Escape" || !snapshot.current) return;
          // Ark closes on Escape anyway; this puts the value back first, so
          // Escape abandons the edit rather than committing it.
          filters.restore(snapshot.current);
        }}
      >
        <div className="data-table__filter-editor" ref={setEditorEl}>
          <PopoverTitle className="data-table__filter-editor-title">
            {description.field}
          </PopoverTitle>
          <TableFilterEditor condition={condition} portalContainer={editorEl} />
        </div>
      </PopoverContent>
    </Popover>
  );
}

/**
 * Focus has to land somewhere deliberate when a chip disappears, or it falls to
 * `<body>` and a keyboard user loses their place entirely.
 */
export function focusAfterRemoval(removedId: string) {
  requestAnimationFrame(() => {
    const bar = document.querySelector(".data-table__filters");
    if (!bar) return;
    const triggers = [...bar.querySelectorAll<HTMLElement>("[data-filter-id]")];
    const next = triggers.find((element) => element.dataset.filterId !== removedId);
    (next ?? bar.querySelector<HTMLElement>("button"))?.focus();
  });
}

// ─── Editor ──────────────────────────────────────────────────────────────────

/**
 * One condition's editor (Figma 2298:726): the field name, the operator, the
 * value, then a rule and a remove.
 *
 * The operator and value controls carry no visible labels — the title above
 * names the field and each control's own content says the rest — but they keep
 * real `<label>`s for assistive tech, hidden in CSS rather than omitted.
 */
export function TableFilterEditor({ condition, portalContainer }: TableFilterEditorProps) {
  const { filters, size } = useTableContext();
  const operators = filters.operatorsFor(condition);
  const arity = filters.arityOf(condition);

  return (
    <>
      <Select
        size={size}
        label="Condition"
        className="data-table__filter-field data-table__filter-field--unlabelled"
        // Portalled into the editor rather than to <body>: the popover is
        // non-modal, so a popup outside its subtree reads as an outside click
        // and dismisses the editor. Same escape Calendar uses for its year
        // picker inside a date popover.
        portalContainer={portalContainer}
        value={condition.operator}
        options={operators.map((operator) => ({ value: operator.id, label: operator.label }))}
        onValueChange={(operator) => filters.update(condition.id, { operator })}
      />

      <TableFilterValueEditor
        condition={condition}
        arity={arity}
        portalContainer={portalContainer}
      />

      <Divider className="data-table__filter-editor-rule" />

      <Button
        intent="ghost"
        size={size}
        icon="trash"
        className="data-table__filter-editor-remove"
        onClick={() => {
          filters.remove(condition.id);
          focusAfterRemoval(condition.id);
        }}
      >
        Remove
      </Button>
    </>
  );
}
