import { Fragment, useMemo, type CSSProperties } from "react";
import { clsx } from "clsx";
import { flexRender } from "@tanstack/react-table";
import { Checkbox } from "@ui-organized/react";
import { cardFieldOrder, type RowData } from "@ui-organized/table-core";
import { useTableContext } from "../../core/TableContext.js";
import { TableRowActions } from "../TableRowActions/index.js";
import { TableEmpty } from "../TableStates/index.js";
import type { TableCardProps, TableCardsProps } from "./TableCards.types.js";

/**
 * Card mode: one card per row, below the breakpoint.
 *
 * The table is *replaced*, not hidden — rendering both trees and hiding one with
 * a container query would double the DOM and defeat virtualization on exactly
 * the devices that can least afford it. Selection, row actions and the detail
 * sheet all keep working, because they are table state rather than table markup.
 */
export function TableCards({ className }: TableCardsProps) {
  const api = useTableContext();
  const { renderRows, options, viewportRef, virtual, label } = api;
  const fields = useMemo(() => cardFieldOrder(options.columns), [options.columns]);
  const spacers = virtual.enabled ? virtual.spacers : { top: 0, bottom: 0 };
  const cap = options.maxHeight;

  if (renderRows.length === 0) {
    return (
      <div className={clsx("data-table__cards", className)}>
        <table className="data-table__table">
          <caption className="data-table__sr-only">{label}</caption>
          <tbody>
            <TableEmpty />
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <ul
      className={clsx("data-table__cards", className)}
      ref={viewportRef}
      aria-label={label}
      style={
        cap === undefined
          ? undefined
          : ({
              "--data-table-max-height": typeof cap === "number" ? `${cap}px` : cap,
            } as CSSProperties)
      }
    >
      {spacers.top > 0 && (
        <li
          className="data-table__card-spacer"
          aria-hidden="true"
          style={{ height: spacers.top }}
        />
      )}
      {renderRows.map(({ row, index }) => (
        <TableCard
          key={row.id}
          row={row}
          index={index}
          fields={fields}
          measureElement={virtual.enabled ? virtual.virtualizer.measureElement : undefined}
        />
      ))}
      {spacers.bottom > 0 && (
        <li
          className="data-table__card-spacer"
          aria-hidden="true"
          style={{ height: spacers.bottom }}
        />
      )}
    </ul>
  );
}

export function TableCard<T extends RowData>({
  row,
  index,
  fields,
  measureElement,
  className,
}: TableCardProps<T>) {
  const api = useTableContext<T>();
  const { selection, primaryColumnId, options, activate, table } = api;
  const selected = selection.isSelected(row.id);
  const cells = row.getVisibleCells();
  const primaryCell = primaryColumnId
    ? cells.find((cell) => cell.column.id === primaryColumnId)
    : undefined;
  const clickable = Boolean(options.detail) || Boolean(options.onRowClick);

  const title = primaryCell
    ? flexRender(primaryCell.column.columnDef.cell, primaryCell.getContext())
    : row.id;

  return (
    <li
      className={clsx("data-table__card", selected && "data-table__card--selected", className)}
      ref={measureElement}
      data-index={index}
      data-row-id={row.id}
    >
      <div className="data-table__card-header">
        {selection.mode !== "none" && (
          <Checkbox
            checked={selected}
            onCheckedChange={(checked) => selection.toggle(row.id, checked)}
            aria-label={`Select ${typeof title === "string" ? title : row.id}`}
          />
        )}
        {/* A button rather than a clickable card: a card is not an interactive
            element, and making one is how a keyboard user loses the row. */}
        {clickable ? (
          <button
            type="button"
            className="data-table__card-title data-table__sort-button"
            onClick={() => activate(row)}
          >
            {title}
          </button>
        ) : (
          <span className="data-table__card-title">{title}</span>
        )}
        {options.rowActions?.length ? <TableRowActions row={row.original} /> : null}
      </div>

      <dl className="data-table__card-fields">
        {fields.map((columnId) => {
          const cell = cells.find((candidate) => candidate.column.id === columnId);
          if (!cell) return null;
          const header = table.getColumn(columnId)?.columnDef.header;
          return (
            <Fragment key={columnId}>
              <dt className="data-table__card-label">
                {typeof header === "string" ? header : columnId}
              </dt>
              <dd className="data-table__card-value">
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </dd>
            </Fragment>
          );
        })}
      </dl>
    </li>
  );
}
