import { memo, useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import type * as React from "react";
import { clsx } from "clsx";
import { flexRender, type RowData } from "@tanstack/react-table";
import { Icon } from "@ui-organized/react";
import {
  alignOf,
  dropSideAt,
  getCaptionProps,
  getCellProps,
  getColProps,
  getHeadCellProps,
  getHeaderRowProps,
  getResizeHandleProps,
  getRootProps,
  getRowProps,
  getSpacerProps,
  getTableProps,
  getViewportProps,
  metaOf,
  resizeKeyDown,
  stickyPositionOf,
  type TableInstance,
} from "@ui-organized/table-core";
import { useTableContext } from "../../core/TableContext.js";
import { TableSelectionFooter } from "../TableSelectionFooter/index.js";
import { reactProps } from "../../core/props.js";
import { TableEmpty, TableError, TableLoading } from "../TableStates/index.js";
import type {
  TableBodyProps,
  TableCellProps,
  TableFooterProps,
  TableHeadCellProps,
  TableHeaderProps,
  TableProps,
  TableRowProps,
  TableViewportProps,
} from "./Table.types.js";
import { internalGlyph as glyph } from "@ui-organized/react";

/**
 * The parts, flat-exported — `TableHeader`, not `Table.Header`. That is the
 * repo's convention everywhere else (`DialogContent`, `MenuItem`) and there is
 * no reason for the table to be the exception.
 *
 * The DOM they compose to:
 *
 *   <Table>              <div class="data-table">        root, size + variant
 *     <TableToolbar>     <div class="data-table__toolbar">
 *     <TableSubBar>      <div class="data-table__subbar">   filters
 *     <TableViewport>    <div class="data-table__viewport"><table>
 *       <TableHeader>    <thead>
 *       <TableBody>      <tbody>   spacer / rows / spacer
 *                        </table><div class="data-table__selection-footer">
 *     <TablePagination>
 *
 * `TableViewport` owns both the scroll container and the `<table>` element
 * because the two are inseparable: a viewport with two tables in it means
 * nothing, and `<caption>` and `<colgroup>` have to be emitted between them.
 */

// ─── Root ────────────────────────────────────────────────────────────────────

export function Table({ children, className }: TableProps) {
  const { chrome, rootRef } = useTableContext();
  const props = getRootProps(chrome);
  return (
    <div {...reactProps(props)} className={clsx(props.className, className)} ref={rootRef}>
      {children}
    </div>
  );
}

// ─── Viewport + <table> ──────────────────────────────────────────────────────

function lengthOf(value: number | string): string {
  return typeof value === "number" ? `${value}px` : value;
}

export function TableViewport({ children, className, maxHeight }: TableViewportProps) {
  const api = useTableContext();
  const { chrome, table, label, captionVisible, interactive, viewportRef, onGridKeyDown } = api;
  const viewport = getViewportProps(chrome);
  const tableProps = getTableProps(chrome);
  const cap = maxHeight ?? api.options.maxHeight;

  return (
    <div
      {...reactProps(viewport)}
      className={clsx(viewport.className, className)}
      ref={viewportRef}
      style={
        cap === undefined
          ? undefined
          : ({ "--data-table-max-height": lengthOf(cap) } as CSSProperties)
      }
    >
      {/* jsx-a11y cannot see the role: `role="grid"` arrives through the spread
          below, conditionally, so a static read of this element sees a bare
          `<table>` with a key handler on it. In interactive mode it is a grid,
          which is precisely the element that should own the keyboard. */}
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
      <table
        {...reactProps<React.TableHTMLAttributes<HTMLTableElement>>(tableProps)}
        // One handler for the whole grid rather than one per cell: the cursor is
        // table state, so the key only has to reach the table. It sits on the
        // element that carries `role="grid"`, not on the scroll container —
        // which is also what stops it being a keyboard handler on a div with no
        // role at all.
        onKeyDown={interactive ? onGridKeyDown : undefined}
      >
        {/* First child of <table>, per the content model. */}
        <caption {...reactProps(getCaptionProps(captionVisible))}>{label}</caption>
        <colgroup>
          {table.getVisibleLeafColumns().map((column) => (
            <col key={column.id} {...reactProps(getColProps(api.columnWidths[column.id]))} />
          ))}
        </colgroup>
        {children}
      </table>
      {/* After the table, inside the scroll container: it sticks to the
          viewport's bottom edge, so it costs a capped table scroll length
          rather than page height. */}
      <TableSelectionFooter />
    </div>
  );
}

// ─── Header ──────────────────────────────────────────────────────────────────

export function TableHeader({ className }: TableHeaderProps) {
  const { table } = useTableContext();
  return (
    <thead className={clsx("data-table__head", className)}>
      {table.getHeaderGroups().map((group) => (
        <tr key={group.id} {...reactProps(getHeaderRowProps())}>
          {group.headers.map((header, index) => (
            <TableHeadCell key={header.id} header={header} index={index} />
          ))}
        </tr>
      ))}
    </thead>
  );
}

export function TableHeadCell<T extends RowData>({ header, index }: TableHeadCellProps<T>) {
  const { table, interactive, focus, reorder } = useTableContext<T>();
  const column = header.column;
  const movable = reorder.active && reorder.isMovable(column.id);
  const drag = reorder.drag;
  const dropSide =
    drag && drag.target === column.id && drag.source !== column.id ? drag.side : undefined;
  const headerText =
    typeof column.columnDef.header === "string" ? column.columnDef.header : column.id;
  const sortable = column.getCanSort();
  const sorted = column.getIsSorted();
  const focused = interactive && focus.cursor.row === -1 && focus.cursor.col === index;
  const editable = Boolean(metaOf<T>(column.columnDef)?.edit);

  const props = getHeadCellProps({
    columnId: column.id,
    index,
    align: alignOf(column.columnDef),
    sortable,
    sortDirection: sorted === false ? false : sorted,
    sticky: stickyPositionOf(table as TableInstance<T>, column),
    resizing: column.getIsResizing(),
    interactive,
    editable,
  });

  const content = header.isPlaceholder
    ? null
    : flexRender(column.columnDef.header, header.getContext());

  return (
    <th
      {...reactProps<React.ThHTMLAttributes<HTMLTableCellElement>>(props)}
      data-cell={`-1:${index}`}
      // The roving tabindex covers the header row too, so ArrowUp out of the
      // first body row lands somewhere focusable and Enter sorts from there.
      tabIndex={interactive ? (focused ? 0 : -1) : undefined}
      onFocus={interactive ? () => focus.setCursor({ row: -1, col: index }) : undefined}
      // The whole header is a drop target; only its label area (below) is a
      // drag source.
      data-dragging={drag?.source === column.id || undefined}
      data-drop={dropSide}
      onDragOver={
        movable && drag
          ? (event) => {
              event.preventDefault();
              event.dataTransfer.dropEffect = "move";
              const side = dropSideAt(event.clientX, event.currentTarget.getBoundingClientRect());
              if (drag.target !== column.id || drag.side !== side) {
                reorder.setDrag({ ...drag, target: column.id, side });
              }
            }
          : undefined
      }
      onDrop={
        movable && drag
          ? (event) => {
              event.preventDefault();
              const side = dropSideAt(event.clientX, event.currentTarget.getBoundingClientRect());
              reorder.drop(drag.source, column.id, side);
              reorder.setDrag(null);
            }
          : undefined
      }
    >
      {/* The drag source is the label area, not the <th>. With the <th>
          draggable, pressing the resize handle — a child of it — started a
          native drag that took the pointer away from the resize after its
          first step; cancelling the drag in dragstart is already too late.
          The handle sits outside this element, so it can never start one. */}
      <div
        className="data-table__head-inner"
        draggable={movable || undefined}
        onDragStart={
          movable
            ? (event) => {
                if ((event.target as Element).closest(".data-table__move")) {
                  event.preventDefault();
                  return;
                }
                event.dataTransfer.effectAllowed = "move";
                event.dataTransfer.setData("text/plain", column.id);
                reorder.setDrag({ source: column.id, target: null, side: "before" });
              }
            : undefined
        }
        onDragEnd={movable ? () => reorder.setDrag(null) : undefined}
      >
        {sortable ? (
          <button
            type="button"
            className="data-table__sort-button"
            // Inner controls are not their own tab stops in a grid; the cell is.
            tabIndex={interactive ? -1 : undefined}
            onClick={column.getToggleSortingHandler()}
          >
            <span className="data-table__head-label">{content}</span>
            {editable && <EditMark />}
            <span className="data-table__sort-icon">
              <Icon name={glyph(sorted === "desc" ? "sort-desc" : "sort-asc")} size={14} />
            </span>
          </button>
        ) : (
          <>
            <span className="data-table__head-label">{content}</span>
            {editable && <EditMark />}
          </>
        )}
        {movable && <MoveButtons columnId={column.id} name={headerText} />}
      </div>
      {column.getCanResize() && <ResizeHandle header={header} />}
    </th>
  );
}

/**
 * Left and right, for a column that can be moved — the click-and-keyboard half
 * of dragging the header. Over the header's end rather than in its flow, so
 * showing them does not shove the label. In `"always"` mode the stylesheet
 * shows them on hover and focus; in `"toggle"` mode they are up for as long as
 * reorder mode is.
 *
 * In an interactive grid they are not tab stops, like every control inside a
 * cell; Alt+Arrow on the focused header is the keyboard route there.
 */
function MoveButtons({ columnId, name }: { columnId: string; name: string }) {
  const { reorder, interactive } = useTableContext();
  const left = useRef<HTMLButtonElement>(null);
  const right = useRef<HTMLButtonElement>(null);

  const press = (direction: -1 | 1, event: React.MouseEvent<HTMLButtonElement>) => {
    const hadFocus = document.activeElement === event.currentTarget;
    reorder.move(columnId, direction);
    if (!hadFocus) return;
    // Re-rendering in the new order moves this header's DOM node, and a moved
    // node drops focus. Put it back on the same button — or on the other one,
    // when this move took the column to the end it pointed at.
    requestAnimationFrame(() => {
      const own = direction === -1 ? left.current : right.current;
      const other = direction === -1 ? right.current : left.current;
      (own && !own.disabled ? own : other)?.focus();
    });
  };

  return (
    <span className="data-table__move" data-mode={reorder.mode}>
      <button
        ref={left}
        type="button"
        className="data-table__move-button"
        aria-label={`Move ${name} left`}
        disabled={!reorder.canMove(columnId, -1)}
        tabIndex={interactive ? -1 : undefined}
        onClick={(event) => press(-1, event)}
      >
        <Icon name={glyph("chevron-left")} size={16} />
      </button>
      <button
        ref={right}
        type="button"
        className="data-table__move-button"
        aria-label={`Move ${name} right`}
        disabled={!reorder.canMove(columnId, 1)}
        tabIndex={interactive ? -1 : undefined}
        onClick={(event) => press(1, event)}
      >
        <Icon name={glyph("chevron-right")} size={16} />
      </button>
    </span>
  );
}

/**
 * The pencil on an editable column's header. The words go with it: as part of
 * the column header, ", editable" is announced with every cell in the column,
 * which is where a screen-reader user needs to learn that Enter opens an editor.
 */
function EditMark() {
  return (
    <span className="data-table__edit-icon">
      <Icon name={glyph("edit")} size={14} />
      <span className="data-table__sr-only">, editable</span>
    </span>
  );
}

/**
 * Pointer drag and keyboard, on one control.
 *
 * The drag is TanStack's own handler; the keyboard is core's `resizeKeyDown`,
 * so the two cannot drift. It is a `role="separator"` with `aria-valuenow`,
 * which is what makes the column width something a screen reader can report
 * rather than something only a mouse can discover.
 */
function ResizeHandle<T extends RowData>({ header }: { header: TableHeadCellProps<T>["header"] }) {
  const { table } = useTableContext<T>();
  const column = header.column;
  const width = column.getSize();
  const bounds = {
    width,
    min: column.columnDef.minSize ?? 0,
    max: column.columnDef.maxSize ?? width,
  };
  const headerDef = column.columnDef.header;
  const props = getResizeHandleProps({
    columnId: column.id,
    columnLabel: typeof headerDef === "string" ? headerDef : column.id,
    width,
    min: bounds.min,
    max: bounds.max,
    active: column.getIsResizing(),
  });

  return (
    <button
      type="button"
      {...reactProps<React.ButtonHTMLAttributes<HTMLButtonElement>>(props)}
      onMouseDown={(event) => {
        // Stops the header's sort button from firing on the same press.
        event.stopPropagation();
        header.getResizeHandler()(event);
      }}
      onTouchStart={(event) => {
        event.stopPropagation();
        header.getResizeHandler()(event);
      }}
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => {
        const action = resizeKeyDown(bounds, {
          key: event.key,
          shift: event.shiftKey,
          ctrl: event.ctrlKey,
          meta: event.metaKey,
        });
        if (action.type === "none") return;
        event.preventDefault();
        event.stopPropagation();
        if (action.type === "reset") {
          table.setColumnSizing((old) => {
            const next = { ...old };
            delete next[column.id];
            return next;
          });
          return;
        }
        table.setColumnSizing((old) => ({ ...old, [column.id]: action.width }));
      }}
    />
  );
}

// ─── Body ────────────────────────────────────────────────────────────────────

function Spacer({ height, colCount }: { height: number; colCount: number }) {
  const { row, cell } = getSpacerProps(height, colCount);
  return (
    <tr {...reactProps(row)}>
      <td {...reactProps<React.TdHTMLAttributes<HTMLTableCellElement>>(cell)} />
    </tr>
  );
}

export function TableBody({ children }: TableBodyProps) {
  const api = useTableContext();
  const { chrome, renderRows, table, interactive, focus, selection, edit, virtual, options } = api;
  const spacers = virtual.enabled ? virtual.spacers : { top: 0, bottom: 0 };
  const clickable = Boolean(options.onRowClick) || Boolean(options.detail);
  const editingRowId = edit.state.target?.rowId;

  // Explicit children win: layer-2 composition is the point of these parts.
  // Otherwise the body decides between its four states itself, which is what
  // makes `<TableBody />` on its own a complete table body.
  if (children) return <tbody className="data-table__body">{children}</tbody>;
  if (options.error) {
    return (
      <tbody className="data-table__body">
        <TableError>{options.error}</TableError>
      </tbody>
    );
  }
  if (api.loading && renderRows.length === 0) {
    return (
      <tbody className="data-table__body">
        <TableLoading />
      </tbody>
    );
  }
  if (renderRows.length === 0) {
    return (
      <tbody className="data-table__body">
        <TableEmpty />
      </tbody>
    );
  }

  return (
    <tbody className="data-table__body">
      {spacers.top > 0 && <Spacer height={spacers.top} colCount={chrome.colCount} />}
      {renderRows.map(({ row, index, absoluteIndex }) => (
        <TableRow
          key={row.id}
          row={row}
          index={index}
          absoluteIndex={absoluteIndex}
          selected={selection.isSelected(row.id)}
          selectable={selection.mode !== "none"}
          editing={editingRowId === row.id}
          focusedCol={focus.cursor.row === index ? focus.cursor.col : null}
          editContext={
            editingRowId === row.id && edit.state.target
              ? edit.contextFor(row, edit.state.target.columnId)
              : null
          }
          interactive={interactive}
          clickable={clickable}
          primaryColumnId={api.primaryColumnId}
          table={table}
          onFocusCell={focus.setCursor}
          onActivate={api.activate}
          onStartEdit={edit.start}
          measureElement={virtual.enabled ? virtual.virtualizer.measureElement : undefined}
        />
      ))}
      {spacers.bottom > 0 && <Spacer height={spacers.bottom} colCount={chrome.colCount} />}
    </tbody>
  );
}

// ─── Row and cell ────────────────────────────────────────────────────────────

export function TableCell<T extends RowData>({
  cell,
  index,
  rowIndex,
  primary,
  focused,
  interactive,
  editContext,
  table,
  onFocusCell,
  onStartEdit,
  row,
}: TableCellProps<T>) {
  const column = cell.column;
  const meta = metaOf<T>(column.columnDef);
  const editing = editContext?.columnId === column.id ? editContext : null;
  const editable = Boolean(meta?.edit) && onStartEdit !== undefined;

  const props = getCellProps({
    columnId: column.id,
    index,
    align: alignOf(column.columnDef),
    primary,
    sticky: stickyPositionOf(table, column),
    focused,
    editable,
    editing: Boolean(editing),
    invalid: Boolean(editing?.invalid),
    interactive,
  });

  // The identifying column is a real row header, which is what makes a screen
  // reader announce "Ada Lovelace, Role, Engineer" instead of just "Engineer".
  const Cell = primary ? "th" : "td";

  return (
    <Cell
      {...reactProps<React.TdHTMLAttributes<HTMLTableCellElement>>(props)}
      data-cell={`${rowIndex}:${index}`}
      onFocus={interactive ? () => onFocusCell({ row: rowIndex, col: index }) : undefined}
      // One click opens the editor. The click stops here either way: it must not
      // also activate the row (open its detail sheet), and a click *inside* the
      // open editor must not restart the edit and throw the draft away.
      onClick={
        editable
          ? (event) => {
              event.stopPropagation();
              if (!editing) onStartEdit?.(row, column.id);
            }
          : undefined
      }
    >
      {editing ? (
        <CellEditor>{meta?.edit?.render(editing) as ReactNode}</CellEditor>
      ) : (
        flexRender(column.columnDef.cell, cell.getContext())
      )}
    </Cell>
  );
}

/**
 * The editor's wrapper, and the thing that puts focus inside it.
 *
 * Focus is the package's job, not the consumer's: `meta.edit.render` returns
 * whatever control the consumer likes, and most of the library's controls do not
 * forward a ref to their inner `<input>` — so a consumer trying to do this
 * themselves would reach for `autoFocus`, which lint bans and which is unreliable
 * for an element mounting mid-interaction.
 *
 * It is also a component rather than an effect inside `TableCell` so that the
 * effect exists only while something is being edited, instead of once per
 * rendered cell.
 */
function CellEditor({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const focusable = ref.current?.querySelector<HTMLElement>(
      'input:not([type="hidden"]), textarea, select, [contenteditable="true"], [tabindex]:not([tabindex="-1"])',
    );
    focusable?.focus();
    if (focusable instanceof HTMLInputElement) focusable.select();
  }, []);

  return (
    <span className="data-table__editor" ref={ref}>
      {children}
    </span>
  );
}

/** Anything a click can mean something to on its own. */
const CONTROL_SELECTOR =
  "a, button, input, select, textarea, label, summary, [contenteditable], [role=button], [role=checkbox], [role=menuitem], [role=menuitemcheckbox], [role=menuitemradio], [role=option], [role=switch], [role=tab]";

/**
 * Whether a click on a row was aimed at the row itself, rather than at a
 * control inside it. A selection checkbox, the row's action menu and an inline
 * editor all live in the row, and opening the detail sheet over the top of
 * them turns every one into a trap. React also bubbles events out of portals
 * by component tree, so a click on the action menu's items — rendered in a
 * popup far outside the row — arrives here too; that is the
 * `contains` check.
 */
export function isRowActivationClick(event: React.MouseEvent<HTMLElement>): boolean {
  const target = event.target as Element | null;
  const row = event.currentTarget;
  if (!target || !row.contains(target)) return false;
  const control = target.closest(CONTROL_SELECTOR);
  return !control || !row.contains(control);
}

function TableRowBase<T extends RowData>({
  row,
  index,
  absoluteIndex,
  selected,
  selectable,
  editing,
  focusedCol,
  editContext,
  interactive,
  clickable,
  primaryColumnId,
  table,
  onFocusCell,
  onActivate,
  onStartEdit,
  measureElement,
}: TableRowProps<T>) {
  const props = getRowProps({
    rowId: row.id,
    index: absoluteIndex,
    selected,
    editing,
    selectable,
    interactive,
    clickable,
  });

  return (
    <tr
      {...reactProps<React.HTMLAttributes<HTMLTableRowElement>>(props)}
      // The virtualizer measures the real row rather than trusting the estimate,
      // so a re-themed row height corrects itself on the first frame.
      ref={measureElement}
      data-index={index}
      onClick={
        onActivate
          ? (event) => {
              if (isRowActivationClick(event)) onActivate(row);
            }
          : undefined
      }
    >
      {row.getVisibleCells().map((cell, colIndex) => (
        <TableCell
          key={cell.id}
          cell={cell}
          row={row}
          index={colIndex}
          rowIndex={index}
          primary={cell.column.id === primaryColumnId}
          focused={focusedCol === colIndex}
          interactive={interactive}
          editContext={editContext}
          table={table}
          onFocusCell={onFocusCell}
          onStartEdit={onStartEdit}
        />
      ))}
    </tr>
  );
}

/**
 * Memoized on row identity plus the handful of things that can change without
 * the row changing. Everything the row needs arrives as a prop for exactly this
 * reason: a row that read the table from context would re-render on every state
 * change in the table, which is the case memoizing exists to avoid.
 */
export const TableRow = memo(
  TableRowBase,
  (prev, next) =>
    prev.row === next.row &&
    prev.index === next.index &&
    prev.absoluteIndex === next.absoluteIndex &&
    prev.selected === next.selected &&
    prev.editing === next.editing &&
    prev.focusedCol === next.focusedCol &&
    prev.editContext === next.editContext &&
    prev.interactive === next.interactive &&
    prev.onActivate === next.onActivate,
) as typeof TableRowBase;

// ─── Footer ──────────────────────────────────────────────────────────────────

export function TableFooter({ children, className }: TableFooterProps) {
  const { table } = useTableContext();
  const groups = table.getFooterGroups();
  const hasFooter = groups.some((group) =>
    group.headers.some((header) => header.column.columnDef.footer !== undefined),
  );
  if (!children && !hasFooter) return null;

  return (
    <tfoot className={clsx("data-table__foot", className)}>
      {children ??
        groups.map((group) => (
          <tr key={group.id} className="data-table__row">
            {group.headers.map((header) => (
              <td key={header.id} className="data-table__cell">
                {header.isPlaceholder
                  ? null
                  : flexRender(header.column.columnDef.footer, header.getContext())}
              </td>
            ))}
          </tr>
        ))}
    </tfoot>
  );
}
