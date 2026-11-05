import { useEffect, useRef, useState } from "react";
import { clsx } from "clsx";
import {
  Button,
  Chip,
  ChipSegment,
  Divider,
  Menu,
  MenuContent,
  MenuItem,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
  MenuTrigger,
  Popover,
  PopoverContent,
  PopoverTitle,
  PopoverTrigger,
} from "@ui-organized/react";
import { afterRowEntrance, type TableFilterCondition } from "@ui-organized/table-core";
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
  container,
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
      <MenuContent align="end" className="data-table__filter-picker" container={container}>
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
 * One condition, as a segmented chip (Figma 2462:2636): "Name | is greater than
 * | 30". Each segment opens the control for the one parameter it shows — the
 * field menu, the operator menu, the value editor — so changing a filter is
 * one click on the part you mean rather than a trip through a form.
 *
 * Removal lives in the field menu and at the foot of the value editor, not in
 * a dismiss button: a fourth 24px target in a row of segments is a coin-flip
 * on touch, and an operator that takes no value ("is empty") has no value
 * editor to put it in.
 */
export function TableFilterChip({ condition, className }: TableFilterChipProps) {
  const { filters } = useTableContext();
  // Which chip's editor is open is filter state, not chip state: the chip that
  // opens is often the one the *header* just created, and removing an open
  // condition has to close its editor rather than leave a dangling id behind.
  const editing = filters.editing === condition.id;
  const setOpen = (next: boolean) => filters.setEditing(next ? condition.id : null);
  // The first chip arrives inside a row that is still animating open, so the
  // editor waits for the row to settle rather than open against a moving
  // anchor and jump. An existing chip settles at once.
  const [valueEl, setValueEl] = useState<HTMLButtonElement | null>(null);
  const [settled, setSettled] = useState(false);
  useEffect(() => {
    if (!editing) {
      setSettled(false);
      return;
    }
    // The segment's ref lands a render after the chip mounts; deciding before
    // it does would find no row and open at once.
    if (!valueEl) return;
    return afterRowEntrance(valueEl, () => setSettled(true));
  }, [editing, valueEl]);
  const open = editing && settled;
  // The two menus are this chip's alone, so they are local.
  const [menu, setMenu] = useState<"field" | "operator" | null>(null);
  const menuState = (name: "field" | "operator") => ({
    open: menu === name,
    onOpenChange: (next: boolean) => setMenu(next ? name : null),
  });

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
  const takesValue = filters.arityOf(condition) !== "none";
  const remove = () => {
    filters.remove(condition.id);
    focusAfterRemoval(condition.id);
  };

  return (
    <Chip
      className={clsx("data-table__filter-chip", className)}
      // The group's name is the whole sentence, so a screen reader moving into
      // any one segment hears what the filter *is* before what the button does.
      aria-label={`Filter: ${description.text}`}
      selected={editing || menu !== null}
      incomplete={!description.complete}
      data-column-id={condition.columnId}
      data-filter-id={condition.id}
    >
      <Menu {...menuState("field")}>
        <MenuTrigger render={<ChipSegment part="label">{description.field}</ChipSegment>} />
        <MenuContent className="data-table__filter-picker">
          <MenuRadioGroup
            value={condition.columnId}
            onValueChange={(columnId) => filters.changeField(condition.id, columnId)}
          >
            {filters.fields.map((field) => (
              <MenuRadioItem key={field.columnId} value={field.columnId}>
                {field.label}
              </MenuRadioItem>
            ))}
          </MenuRadioGroup>
          <MenuSeparator />
          <MenuItem value="remove" icon="trash" onSelect={remove}>
            Remove filter
          </MenuItem>
        </MenuContent>
      </Menu>

      <Menu {...menuState("operator")}>
        <MenuTrigger
          render={<ChipSegment part="operator">{description.relative}</ChipSegment>}
        />
        <MenuContent className="data-table__filter-picker">
          <MenuRadioGroup
            value={condition.operator}
            onValueChange={(operator) => filters.update(condition.id, { operator })}
          >
            {filters.operatorsFor(condition).map((operator) => (
              <MenuRadioItem key={operator.id} value={operator.id}>
                {operator.label}
              </MenuRadioItem>
            ))}
          </MenuRadioGroup>
        </MenuContent>
      </Menu>

      {takesValue && (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger
            render={
              <ChipSegment ref={setValueEl} part="value">
                {description.value}
              </ChipSegment>
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
                {description.field} {description.relative}
              </PopoverTitle>
              <TableFilterEditor condition={condition} portalContainer={editorEl} />
            </div>
          </PopoverContent>
        </Popover>
      )}
    </Chip>
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
    const chips = [...bar.querySelectorAll<HTMLElement>("[data-filter-id]")];
    const next = chips.find((element) => element.dataset.filterId !== removedId);
    (next?.querySelector<HTMLElement>("button") ?? bar.querySelector<HTMLElement>("button"))?.focus();
  });
}

// ─── Editor ──────────────────────────────────────────────────────────────────

/**
 * One condition's value editor (Figma 2298:726): the value, then a rule and a
 * remove. The field and the operator have segments of their own on the chip,
 * so the editor carries only what the value segment opens.
 */
export function TableFilterEditor({ condition, portalContainer }: TableFilterEditorProps) {
  const { filters, size } = useTableContext();
  const arity = filters.arityOf(condition);

  return (
    <>
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
