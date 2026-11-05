import { useEffect, useState, type ReactNode } from "react";
import {
  Accordion,
  Button,
  RadioGroup,
  Select,
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetTitle,
  SheetTrigger,
} from "@ui-organized/react";
import type { CanonicalIconName } from "@ui-organized/utils";
import { useTableContext } from "../../core/TableContext.js";
import { TableFilterValueEditor } from "../TableFilters/TableFilterValue.js";
import type {
  TableFilterSheetProps,
  TableSheetButtonProps,
  TableSortSheetProps,
} from "./TableSheets.types.js";
import type { TableFilterCondition } from "@ui-organized/table-core";

/**
 * Card mode's sort and filter controls: a labelled button that opens a bottom
 * sheet holding every control for that one concern.
 *
 * A menu anchored to a 36px icon is a desktop affordance. On a phone the menu
 * covers the cards it is sorting, and the filter chips wrap into a second
 * toolbar above a list that is already short of room. A sheet gives the
 * controls the full width and puts them within thumb reach, and the chips row
 * goes away: what is applied is counted on the button instead.
 */

/**
 * The button both sheets open from. The count is a badge inside the label,
 * and is spoken as words — "Filter, 2 applied" — because a bare "2" announced
 * after "Filter" says nothing about what it counts.
 */
export function TableSheetButton({ icon, label, count, unit, ...props }: TableSheetButtonProps) {
  const { size } = useTableContext();
  return (
    <Button intent="secondary" size={size} icon={icon as CanonicalIconName} {...props}>
      {label}
      {count > 0 && (
        <>
          <span className="data-table__badge" aria-hidden="true">
            {count}
          </span>
          <span className="data-table__sr-only">{`, ${count} ${unit}`}</span>
        </>
      )}
    </Button>
  );
}

function SheetShell({
  trigger,
  title,
  footer,
  open,
  onOpenChange,
  children,
}: {
  trigger: ReactNode;
  title: string;
  footer: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {trigger}
      <SheetContent side="bottom" size="lg" className="data-table__sheet">
        <SheetTitle>{title}</SheetTitle>
        <div className="data-table__sheet-body">{children}</div>
        <SheetFooter>{footer}</SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

// ─── Sort ────────────────────────────────────────────────────────────────────

export function TableSortSheet({ label = "Sort", className }: TableSortSheetProps) {
  const { table, size } = useTableContext();
  const columns = table.getAllLeafColumns().filter((column) => column.getCanSort());
  if (columns.length === 0) return null;

  const [active] = table.state.sorting;
  const activeId = active?.id ?? "";
  const direction = active?.desc ? "desc" : "asc";

  return (
    <SheetShell
      title={label}
      trigger={
        <SheetTrigger
          render={
            <TableSheetButton
              icon={activeId ? (active?.desc ? "sort-desc" : "sort-asc") : "sort"}
              label={label}
              count={table.state.sorting.length}
              unit="applied"
              className={className}
            />
          }
        />
      }
      footer={
        <>
          <Button
            intent="ghost"
            size="lg"
            disabled={!activeId}
            onClick={() => table.setSorting([])}
          >
            Clear sort
          </Button>
          <SheetClose
            render={
              <Button intent="primary" size="lg">
                Done
              </Button>
            }
          />
        </>
      }
    >
      <RadioGroup
        label="Sort by"
        options={columns.map((column) => {
          const header = column.columnDef.header;
          return { value: column.id, label: typeof header === "string" ? header : column.id };
        })}
        value={activeId}
        onValueChange={(id) => table.setSorting([{ id, desc: direction === "desc" }])}
      />
      {/* Disabled rather than hidden, as in the desktop menu: the sheet keeps
          its shape, so the second visit finds the controls where they were. */}
      <RadioGroup
        label="Direction"
        orientation="horizontal"
        disabled={!activeId}
        options={[
          { value: "asc", label: "Ascending" },
          { value: "desc", label: "Descending" },
        ]}
        // Nothing is checked until there is a sort to have a direction: a
        // pre-ticked "Ascending" over nothing reads as a sort that is applied.
        value={activeId ? direction : ""}
        onValueChange={(next) => {
          if (activeId) table.setSorting([{ id: activeId, desc: next === "desc" }]);
        }}
      />
    </SheetShell>
  );
}

// ─── Filter ──────────────────────────────────────────────────────────────────

/**
 * Every filterable field at once, one accordion section each, so filtering on
 * a phone is "open the field, pick the value" rather than "add a filter,
 * choose its field, then pick the value".
 *
 * Each section edits a real condition. While the sheet is open every field has
 * at least one, so its editor has something to write to: the sheet adds an
 * empty draft for any field without one. A draft is an incomplete condition,
 * which the filter model keeps but never applies, so drafts change nothing
 * until they are given a value; the badge counts only complete conditions;
 * and closing the sheet removes the drafts nobody filled in.
 */
export function TableFilterSheet({ label = "Filter", className }: TableFilterSheetProps) {
  const { filters, size } = useTableContext();
  const [open, setOpen] = useState(false);
  const applied = filters.conditions.filter((condition) => filters.describe(condition).complete);
  const count = applied.length;

  // Re-run on every change while open, not just on opening: "Clear" empties a
  // field, and that field then needs a fresh draft to keep its editor.
  const missing = open
    ? filters.fields.filter(
        (field) => !filters.conditions.some((condition) => condition.columnId === field.columnId),
      )
    : [];
  const missingKey = missing.map((field) => field.columnId).join(",");
  useEffect(() => {
    if (!missingKey) return;
    for (const columnId of missingKey.split(",")) filters.add(columnId);
    // `filters.add` also marks the condition as being edited, which opens a
    // chip's popover in table mode. There are no chips here; undo it.
    filters.setEditing(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [missingKey]);

  const onOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      for (const condition of filters.conditions) {
        if (!filters.describe(condition).complete) filters.remove(condition.id);
      }
    }
  };

  if (filters.fields.length === 0) return null;

  return (
    <SheetShell
      title={label}
      open={open}
      onOpenChange={onOpenChange}
      trigger={
        <SheetTrigger
          render={
            <TableSheetButton
              icon="filter"
              label={label}
              count={count}
              unit="applied"
              className={className}
            />
          }
        />
      }
      footer={
        <>
          <Button
            intent="ghost"
            size="lg"
            disabled={count === 0}
            onClick={() => {
              for (const condition of applied) filters.remove(condition.id);
            }}
          >
            Clear all
          </Button>
          <SheetClose
            render={
              <Button intent="primary" size="lg">
                Done
              </Button>
            }
          />
        </>
      }
    >
      <Accordion
        multiple
        className="data-table__sheet-sections"
        // Every section starts collapsed, so the whole list of fields fits on
        // screen at once; each header says what it applies, so nothing is
        // hidden by being closed. Open one to edit it.
        items={filters.fields.map((field) => {
          const conditions = filters.conditions.filter(
            (condition) => condition.columnId === field.columnId,
          );
          const summary = conditions
            .filter((condition) => filters.describe(condition).complete)
            .map((condition) => {
              const description = filters.describe(condition);
              return `${description.relative} ${description.value}`;
            })
            .join("; ");
          return {
            value: field.columnId,
            title: (
              <span className="data-table__sheet-section-title">
                <span>{field.label}</span>
                {/* What is applied stays readable with the section collapsed. */}
                {summary && <span className="data-table__sheet-section-summary">{summary}</span>}
              </span>
            ),
            content: (
              <div className="data-table__sheet-section">
                {conditions.map((condition) => (
                  <TableFilterSheetCondition
                    key={condition.id}
                    condition={condition}
                    fieldLabel={field.label}
                  />
                ))}
              </div>
            ),
          };
        })}
      />
    </SheetShell>
  );
}

/**
 * One condition inside a field's section: its relation, its value, and a way
 * to clear it. The field is the section, so there is no field control.
 */
function TableFilterSheetCondition({
  condition,
  fieldLabel,
}: {
  condition: TableFilterCondition;
  fieldLabel: string;
}) {
  const { filters, size } = useTableContext();
  // The sheet is a modal dialog, which hides everything outside itself from
  // assistive tech; a Select or Listbox that portals to <body> would be painted
  // but unreachable. Portalling into the condition keeps it inside.
  const [container, setContainer] = useState<HTMLElement | null>(null);
  const description = filters.describe(condition);

  return (
    <div className="data-table__sheet-filter" ref={setContainer} data-filter-id={condition.id}>
      <Select
        size={size}
        label="Condition"
        options={filters.operatorsFor(condition).map((op) => ({ value: op.id, label: op.label }))}
        value={condition.operator}
        onValueChange={(operator) => filters.update(condition.id, { operator })}
        portalContainer={container}
      />
      <div className="data-table__sheet-filter-value">
        <TableFilterValueEditor
          condition={condition}
          arity={filters.arityOf(condition)}
          portalContainer={container}
        />
      </div>
      {description.complete && (
        <Button
          intent="ghost"
          size={size}
          icon="close"
          className="data-table__sheet-remove"
          aria-label={`Clear filter: ${description.text}`}
          onClick={() => filters.remove(condition.id)}
        >
          {`Clear ${fieldLabel}`}
        </Button>
      )}
    </div>
  );
}
