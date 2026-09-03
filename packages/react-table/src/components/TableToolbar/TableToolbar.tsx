import { clsx } from "clsx";
import {
  Button,
  Divider,
  Menu,
  MenuCheckboxItem,
  MenuContent,
  MenuGroup,
  MenuGroupLabel,
  MenuItem,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
  MenuTrigger,
  SearchInput,
} from "@ui-organized/react";
import type { CanonicalIconName } from "@ui-organized/utils";
import { toggleableColumns } from "@ui-organized/table-core";
import { useTableContext } from "../../core/TableContext.js";
import { TableFilterAdd, TableFilters } from "../TableFilters/index.js";
import type {
  TableActionsProps,
  TableExportMenuProps,
  TableScrollButtonsProps,
  TableSearchProps,
  TableSortMenuProps,
  TableToolbarProps,
  TableViewOptionsProps,
} from "./TableToolbar.types.js";

/**
 * The row above the table: search, filters, and the controls that change what
 * the table shows rather than what it contains.
 *
 * Not a `Toolbar` — that component is a `role="toolbar"` with roving focus,
 * which is right for a cluster of icon buttons and wrong for a row containing a
 * text input. The selection bar, which *is* a button cluster, does use it.
 */
export function TableToolbar({ children, className }: TableToolbarProps) {
  const { options, table, scroll } = useTableContext();
  if (children) {
    return <div className={clsx("data-table__toolbar", className)}>{children}</div>;
  }

  const searchable = options.searchable ?? true;
  const hideable = options.hideableColumns ?? false;
  const exportable = options.exportable ?? false;
  const filterable = options.filterable ?? true;
  const actions = options.actions ?? [];
  const sortMenu =
    (options.sortMenu ?? true) &&
    (options.sortable ?? true) &&
    table.getAllLeafColumns().some((column) => column.getCanSort());

  // `scroll.overflowing` counts: a table whose only chrome is the two scroll
  // buttons still needs the row to put them in — columns off the right edge are
  // no less hidden for the table having no search box.
  if (
    !searchable &&
    !hideable &&
    !exportable &&
    !filterable &&
    !sortMenu &&
    !scroll.overflowing &&
    actions.length === 0
  ) {
    return null;
  }

  // Two rows, deliberately. Chips wrap — often onto a second and third line —
  // and sharing a row with the controls would shunt those around every time a
  // filter is added. Keeping the applied filters on their own line below is
  // also what makes them read as a summary rather than as more chrome.
  return (
    <>
      <div className={clsx("data-table__toolbar", className)}>
        {searchable && <TableSearch />}
        <div className="data-table__toolbar-spacer" />

        <TableActions />
        {/* Only when there is something on both sides of it. A rule with
            nothing to its left is a rule separating the toolbar from its own
            edge, which says nothing. */}
        {actions.length > 0 && (
          <Divider orientation="vertical" className="data-table__toolbar-divider" />
        )}

        {sortMenu && <TableSortMenu />}
        {filterable && <TableFilterAdd iconOnly />}
        {exportable && <TableExportMenu />}
        {hideable && <TableViewOptions />}
        {/* Last, and only while the viewport is actually hiding columns. */}
        <TableScrollButtons />
      </div>
      <TableFilters />
    </>
  );
}

/**
 * The developer's own header buttons — "New user", "Import", "Refresh".
 *
 * Rendered as real buttons rather than folded into a menu, because these are
 * the actions a page is *for*: a primary action hidden behind an overflow menu
 * is a primary action nobody finds. Each carries whatever intent the developer
 * gave it, so exactly one of them can be the page's call to action and the rest
 * can recede.
 */
export function TableActions({ actions, className }: TableActionsProps) {
  const { options, size } = useTableContext();
  const items = actions ?? options.actions ?? [];
  if (items.length === 0) return null;

  return (
    <div className={clsx("data-table__toolbar-actions", className)}>
      {items.map((action) => {
        const icon = action.icon as CanonicalIconName | undefined;
        const iconOnly = action.iconOnly === true && icon !== undefined;
        return (
          <Button
            key={action.id}
            intent={action.intent ?? "tertiary"}
            size={size}
            icon={icon}
            disabled={action.disabled}
            // An icon-only button drops its visible label but keeps its
            // accessible one — the label is the whole name either way.
            aria-label={iconOnly ? action.label : undefined}
            onClick={() => void action.onRun()}
          >
            {iconOnly ? undefined : action.label}
          </Button>
        );
      })}
    </div>
  );
}

/**
 * Sorting, from the header rather than from a column.
 *
 * The column headers already sort, so in table mode this is a convenience. In
 * **card mode it is the only sort control there is** — there are no headers to
 * click — and a table that silently loses the ability to sort at 640px is a
 * table that is broken on phones.
 *
 * One column at a time. Multi-column sort stays where it is discoverable and
 * cheap: shift-clicking headers.
 */
export function TableSortMenu({ label = "Sort", className }: TableSortMenuProps) {
  const { table, size } = useTableContext();
  const columns = table.getAllLeafColumns().filter((column) => column.getCanSort());
  if (columns.length === 0) return null;

  const [active] = table.getState().sorting;
  const activeId = active?.id ?? "";
  const direction = active?.desc ? "desc" : "asc";

  return (
    <Menu>
      <MenuTrigger
        render={
          <Button
            intent="secondary"
            size={size}
            icon={activeId ? (active?.desc ? "sort-desc" : "sort-asc") : "sort"}
            aria-label={label}
            className={className}
          />
        }
      />
      <MenuContent align="end" className="data-table__sort-menu">
        <MenuGroup>
          <MenuGroupLabel>Sort by</MenuGroupLabel>
          <MenuRadioGroup
            value={activeId}
            onValueChange={(id) => table.setSorting(id ? [{ id, desc: direction === "desc" }] : [])}
          >
            {columns.map((column) => {
              const header = column.columnDef.header;
              return (
                <MenuRadioItem key={column.id} value={column.id}>
                  {typeof header === "string" ? header : column.id}
                </MenuRadioItem>
              );
            })}
          </MenuRadioGroup>
        </MenuGroup>

        <MenuSeparator />

        <MenuGroup>
          <MenuGroupLabel>Direction</MenuGroupLabel>
          <MenuRadioGroup
            value={direction}
            onValueChange={(next) => {
              if (activeId) table.setSorting([{ id: activeId, desc: next === "desc" }]);
            }}
          >
            {/* Disabled rather than hidden: the choice is always part of the
                menu's shape, and a menu that changes length as you use it is
                harder to aim at the second time. */}
            <MenuRadioItem value="asc" disabled={!activeId}>
              Ascending
            </MenuRadioItem>
            <MenuRadioItem value="desc" disabled={!activeId}>
              Descending
            </MenuRadioItem>
          </MenuRadioGroup>
        </MenuGroup>

        {activeId && (
          <>
            <MenuSeparator />
            <MenuItem value="clear-sorting" onSelect={() => table.setSorting([])}>
              Clear sorting
            </MenuItem>
          </>
        )}
      </MenuContent>
    </Menu>
  );
}

export function TableSearch({ placeholder = "Search", label, className }: TableSearchProps) {
  const { search, setSearch, size, label: tableLabel } = useTableContext();
  return (
    <SearchInput
      className={clsx("data-table__search", className)}
      size={size}
      value={search}
      placeholder={placeholder}
      aria-label={label ?? `Search ${tableLabel}`}
      onChange={(event) => setSearch(event.target.value)}
      onClear={() => setSearch("")}
    />
  );
}

/**
 * Column visibility, and — when reordering is on — the keyboard-reachable half
 * of reordering. A drag-only affordance fails the a11y gate, so the menu is the
 * primary control and the drag is the enhancement.
 */
export function TableViewOptions({ label = "Columns", className }: TableViewOptionsProps) {
  const { table, size, options } = useTableContext();
  const columns = toggleableColumns(table.getAllLeafColumns());
  if (columns.length === 0) return null;

  return (
    <Menu>
      <MenuTrigger
        render={<Button intent="secondary" size={size} icon="settings" aria-label={label} />}
      />
      <MenuContent align="end" className={className}>
        <MenuGroup>
          <MenuGroupLabel>Visible columns</MenuGroupLabel>
          {columns.map((column) => {
            const header = column.columnDef.header;
            return (
              <MenuCheckboxItem
                key={column.id}
                value={column.id}
                checked={column.getIsVisible()}
                onCheckedChange={(checked) => column.toggleVisibility(checked)}
              >
                {typeof header === "string" ? header : column.id}
              </MenuCheckboxItem>
            );
          })}
        </MenuGroup>
        {options.reorderable && (
          <>
            <MenuSeparator />
            <MenuGroup>
              <MenuGroupLabel>Reset</MenuGroupLabel>
              <MenuItem value="reset-order" onSelect={() => table.resetColumnOrder()}>
                Reset column order
              </MenuItem>
              <MenuItem value="reset-sizing" onSelect={() => table.resetColumnSizing()}>
                Reset column widths
              </MenuItem>
            </MenuGroup>
          </>
        )}
      </MenuContent>
    </Menu>
  );
}

/**
 * Export scopes are separate items rather than one button, because "download"
 * means three different things depending on what is filtered and what is
 * ticked — and silently picking one is how an export loses rows.
 */
export function TableExportMenu({ label = "Export", className }: TableExportMenuProps) {
  const { exportCsv, copySelection, selection, size } = useTableContext();
  const hasSelection = selection.count > 0;

  return (
    <Menu>
      <MenuTrigger
        render={<Button intent="secondary" size={size} icon="download" aria-label={label} />}
      />
      <MenuContent align="end" className={className}>
        <MenuItem value="csv-view" icon="download" onSelect={() => exportCsv("view")}>
          Download this view (CSV)
        </MenuItem>
        <MenuItem
          value="csv-selected"
          icon="download"
          disabled={!hasSelection}
          onSelect={() => exportCsv("selected")}
        >
          Download selected rows (CSV)
        </MenuItem>
        <MenuItem value="csv-all" icon="download" onSelect={() => exportCsv("all")}>
          Download all rows (CSV)
        </MenuItem>
        <MenuSeparator />
        <MenuItem
          value="copy"
          icon="copy"
          disabled={!hasSelection}
          onSelect={() => void copySelection("selected")}
        >
          Copy selection to clipboard
        </MenuItem>
      </MenuContent>
    </Menu>
  );
}

/**
 * Left and right, for a table wider than its viewport.
 *
 * The scrollbar is the primary affordance; this is the *visible* one. A mouse
 * with no horizontal wheel, a thin overlay scrollbar that only paints while it
 * is moving, and a pinned first column that makes a half-cut column at the edge
 * look deliberate all leave "there are more columns over there" as something the
 * user has to guess at.
 *
 * Absent rather than disabled when everything fits: a pair of permanently dead
 * buttons in every toolbar is worse noise than no buttons at all. At the ends of
 * the scroll they *are* disabled — the same call `Pagination` makes for its own
 * prev/next, so the two read the same way.
 */
export function TableScrollButtons({
  leftLabel = "Scroll left",
  rightLabel = "Scroll right",
  className,
}: TableScrollButtonsProps) {
  const { scroll, size } = useTableContext();
  if (!scroll.overflowing) return null;

  return (
    // Grouped, and tighter than the toolbar's own gap: two halves of one
    // control rather than two more buttons in the row.
    <div className={clsx("data-table__scroll-buttons", className)}>
      <Button
        intent="secondary"
        size={size}
        icon="chevron-left"
        aria-label={leftLabel}
        disabled={!scroll.canScrollLeft}
        onClick={() => scroll.by(-1)}
      />
      <Button
        intent="secondary"
        size={size}
        icon="chevron-right"
        aria-label={rightLabel}
        disabled={!scroll.canScrollRight}
        onClick={() => scroll.by(1)}
      />
    </div>
  );
}
