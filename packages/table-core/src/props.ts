/**
 * Prop builders — plain objects an adapter spreads onto a real element.
 *
 * This is where the markup contract lives. Every class name, ARIA attribute and
 * sticky offset the table depends on is decided here, in one framework-free
 * place, so a Vue adapter inherits the same semantics and the same look without
 * re-deriving either.
 *
 * The rendering model these encode is deliberate: a real `<table>` with
 * `table-layout: fixed` and a `<colgroup>`, virtualized with spacer rows rather
 * than absolute positioning. `display: grid` on table elements destroys the
 * implicit table roles and forces a hand-rolled ARIA grid — expensive to get
 * right and expensive to keep right under a blocking axe gate.
 */
import { clsx } from "clsx";
import type { TableAlign, TableSize, TableVariant } from "./types.js";
import { ACTIONS_COLUMN_ID, SELECTION_COLUMN_ID } from "./columns.js";
import { dataTableStyles, tableCellStyles, tableHeadCellStyles } from "./styles.js";

// ─── The prop bag ────────────────────────────────────────────────────────────

/**
 * The inline styles the builders actually set. Narrow on purpose: a
 * `Record<string, string | number>` is not assignable to React's
 * `CSSProperties`, and widening it here would push a cast into every call site
 * instead of the one at the adapter boundary.
 */
export interface TableStyle {
  width?: string | number;
  minWidth?: string | number;
  maxWidth?: string | number;
  height?: string | number;
  minHeight?: string | number;
  left?: string | number;
  right?: string | number;
  top?: string | number;
  position?: "sticky" | "relative" | "absolute" | "static";
  tableLayout?: "fixed" | "auto";
  textAlign?: "left" | "center" | "right" | "start" | "end";
  zIndex?: number;
  transform?: string;
}

export type AttrValue = string | number | boolean | undefined;

/** What a prop builder returns: spread it onto an element and nothing else. */
export interface ElementProps {
  className?: string;
  style?: TableStyle;
  role?: string;
  tabIndex?: number;
  id?: string;
  scope?: "col" | "row" | "colgroup" | "rowgroup";
  colSpan?: number;
  hidden?: boolean;
  title?: string;
  [aria: `aria-${string}`]: AttrValue;
  [data: `data-${string}`]: AttrValue;
}

// ─── Shared context ──────────────────────────────────────────────────────────

/** Where a pinned column sits once the viewport has scrolled. */
export interface StickyPosition {
  side: "left" | "right";
  /** Distance from the edge, in pixels, from `column.getStart()`/`getAfter()`. */
  offset: number;
  /** The innermost pinned column on this side — the one that casts the shadow. */
  last: boolean;
}

export interface TableChrome {
  size: TableSize;
  variant: TableVariant;
  /**
   * Grid mode. True when anything in the table takes focus or changes state —
   * selection, inline edit, row activation. False gives the plain table role,
   * which is both simpler and better announced when there is nothing to operate.
   */
  interactive: boolean;
  /** Sum of the visible column widths, in pixels. */
  totalWidth: number;
  /** Rows in the whole dataset, not the rendered window. */
  rowCount: number;
  /** Visible columns. */
  colCount: number;
  /** Accessible name. Rendered into `<caption>`, visually hidden by default. */
  label: string;
  /** Multiple row selection is enabled. Only meaningful in grid mode. */
  multiSelectable?: boolean;
}

// ─── Root and viewport ───────────────────────────────────────────────────────

export function getRootProps(chrome: Pick<TableChrome, "size" | "variant">): ElementProps {
  return {
    className: dataTableStyles({ size: chrome.size, variant: chrome.variant }),
    "data-size": chrome.size,
  };
}

/**
 * The scroll container.
 *
 * `ScrollArea` cannot be used here: it exposes no viewport ref and no
 * `onScroll`, so a virtualizer has nothing to attach to. This is our own
 * container, styled in `styles/table.css` to match `scroll-area__scrollbar`.
 *
 * In static mode it is a labelled, focusable `region` — a scrollable container
 * with nothing focusable inside is unreachable by keyboard otherwise, which is
 * both an axe failure (`scrollable-region-focusable`) and a real one. In
 * interactive mode the cells themselves take focus, so the extra tab stop would
 * only be noise.
 */
export function getViewportProps(chrome: Pick<TableChrome, "interactive" | "label">): ElementProps {
  return {
    className: "data-table__viewport",
    role: chrome.interactive ? undefined : "region",
    tabIndex: chrome.interactive ? undefined : 0,
    "aria-label": chrome.interactive ? undefined : chrome.label,
  };
}

export function getTableProps(chrome: TableChrome): ElementProps {
  return {
    className: "data-table__table",
    role: chrome.interactive ? "grid" : undefined,
    // `table-layout: fixed` plus explicit `<col>` widths is what stops columns
    // jittering as virtualized rows with different content swap in and out.
    style: { tableLayout: "fixed", width: chrome.totalWidth },
    // The full dataset, +1 for the header row — so a screen reader says
    // "row 4,312 of 100,000" rather than "row 4 of 30".
    "aria-rowcount": chrome.rowCount + 1,
    "aria-colcount": chrome.colCount,
    "aria-multiselectable": chrome.interactive && chrome.multiSelectable ? true : undefined,
  };
}

export function getColProps(width: number | undefined): ElementProps {
  return { style: width === undefined ? undefined : { width } };
}

export function getCaptionProps(visible: boolean): ElementProps {
  return {
    className: clsx("data-table__caption", !visible && "data-table__caption--hidden"),
  };
}

// ─── Header ──────────────────────────────────────────────────────────────────

export function getHeaderRowProps(): ElementProps {
  return { className: "data-table__head-row", "aria-rowindex": 1 };
}

export interface HeadCellContext {
  columnId: string;
  /** 0-based index among visible columns. */
  index: number;
  align?: TableAlign;
  sortable?: boolean;
  sortDirection?: "asc" | "desc" | false;
  sticky?: StickyPosition;
  resizing?: boolean;
  interactive?: boolean;
}

/**
 * The two columns the table adds for itself hold a *control* — a checkbox, a
 * menu trigger — where every other cell holds text. They are marked so the
 * stylesheet can opt them out of the truncation every other cell wants: a cell
 * whose inline box overflows by a pixel paints a "…", and a "…" next to a row's
 * action menu reads as data that was cut off.
 */
function systemColumnClass(columnId: string): string | false {
  if (columnId === SELECTION_COLUMN_ID) return "data-table__select-cell";
  if (columnId === ACTIONS_COLUMN_ID) return "data-table__actions-cell";
  return false;
}

export function getHeadCellProps(cell: HeadCellContext): ElementProps {
  return {
    className: clsx(
      tableHeadCellStyles({ align: cell.align ?? "start", sortable: Boolean(cell.sortable) }),
      systemColumnClass(cell.columnId),
      cell.sticky && "data-table__cell--sticky",
      cell.sticky?.last && `data-table__cell--sticky-${cell.sticky.side}-edge`,
    ),
    scope: "col",
    // Announced as "sorted ascending" / "not sorted". Omitted entirely when the
    // column cannot be sorted — "none" on a fixed column is a lie.
    "aria-sort": cell.sortable
      ? cell.sortDirection === "asc"
        ? "ascending"
        : cell.sortDirection === "desc"
          ? "descending"
          : "none"
      : undefined,
    "aria-colindex": cell.interactive ? cell.index + 1 : undefined,
    style: stickyStyle(cell.sticky),
    "data-column-id": cell.columnId,
    "data-resizing": cell.resizing ? "" : undefined,
  };
}

export interface ResizeHandleContext {
  columnId: string;
  /** Header text, for the accessible name. */
  columnLabel: string;
  width: number;
  min: number;
  max: number;
  active?: boolean;
}

/**
 * A focusable `role="separator"`, not a bare drag target: arrows resize by
 * `RESIZE_STEP`, Shift+arrow by `RESIZE_STEP_FINE`, Enter resets. A drag-only
 * affordance is unusable by keyboard and fails the a11y gate.
 */
export function getResizeHandleProps(handle: ResizeHandleContext): ElementProps {
  return {
    className: clsx(
      "data-table__resize-handle",
      handle.active && "data-table__resize-handle--active",
    ),
    role: "separator",
    tabIndex: 0,
    "aria-orientation": "vertical",
    "aria-label": `Resize ${handle.columnLabel} column`,
    "aria-valuenow": Math.round(handle.width),
    "aria-valuemin": handle.min,
    "aria-valuemax": handle.max,
    "data-column-id": handle.columnId,
    "data-active": handle.active ? "" : undefined,
  };
}

// ─── Body ────────────────────────────────────────────────────────────────────

export interface RowContext {
  rowId: string;
  /** 0-based index in the full dataset — not in the rendered window. */
  index: number;
  selected?: boolean;
  editing?: boolean;
  focused?: boolean;
  /** Row selection is enabled at all. Gates `aria-selected`. */
  selectable?: boolean;
  interactive: boolean;
  /** Row-level click handler is wired, so the row shows as actionable. */
  clickable?: boolean;
}

export function getRowProps(row: RowContext): ElementProps {
  return {
    className: clsx(
      "data-table__row",
      row.selected && "data-table__row--selected",
      row.editing && "data-table__row--editing",
      row.clickable && "data-table__row--clickable",
    ),
    // +2: `aria-rowindex` is 1-based and the header occupies row 1.
    "aria-rowindex": row.index + 2,
    // Only a grid may carry `aria-selected`; on a plain table it is an
    // `aria-allowed-attr` violation, which is a blocking axe failure here.
    "aria-selected": row.interactive && row.selectable ? Boolean(row.selected) : undefined,
    "data-row-id": row.rowId,
    "data-selected": row.selected ? "" : undefined,
  };
}

export interface CellContext {
  columnId: string;
  index: number;
  align?: TableAlign;
  /** The identifying column, rendered as `<th scope="row">`. */
  primary?: boolean;
  sticky?: StickyPosition;
  focused?: boolean;
  editing?: boolean;
  invalid?: boolean;
  interactive: boolean;
}

/**
 * Roving tabindex lives here. In grid mode exactly one cell in the table carries
 * `tabIndex={0}`; every other cell is -1 and reachable with the arrow keys, so
 * the table is a single tab stop rather than one per cell.
 *
 * One honest limitation: `Checkbox` has a closed prop API with no `tabIndex`,
 * so a selection checkbox stays natively tabbable inside its cell. It is not an
 * accessibility failure — the control is reachable and labelled — but it does
 * add tab stops a fully roving grid would not have.
 */
export function getCellProps(cell: CellContext): ElementProps {
  return {
    className: clsx(
      tableCellStyles({ align: cell.align ?? "start" }),
      systemColumnClass(cell.columnId),
      cell.primary && "data-table__cell--primary",
      cell.sticky && "data-table__cell--sticky",
      cell.sticky?.last && `data-table__cell--sticky-${cell.sticky.side}-edge`,
      cell.editing && "data-table__cell--editing",
      cell.invalid && "data-table__cell--invalid",
    ),
    scope: cell.primary ? "row" : undefined,
    tabIndex: cell.interactive ? (cell.focused ? 0 : -1) : undefined,
    "aria-colindex": cell.interactive ? cell.index + 1 : undefined,
    "aria-invalid": cell.invalid ? true : undefined,
    style: stickyStyle(cell.sticky),
    "data-column-id": cell.columnId,
  };
}

/**
 * The leading and trailing rows that stand in for everything the virtualizer
 * is not rendering. Native table semantics survive intact — the rows are simply
 * hidden from the accessibility tree, and position is reported by the explicit
 * `aria-rowindex` on the real rows either side of them.
 *
 * `role="presentation"` is deliberately NOT set: an element carrying a global
 * ARIA attribute (`aria-hidden` is one) has its presentation role dropped by the
 * conflict-resolution rules, so it buys nothing and trips axe's
 * `presentation-role-conflict` check.
 */
export function getSpacerProps(
  height: number,
  colCount: number,
): { row: ElementProps; cell: ElementProps } {
  return {
    row: { className: "data-table__spacer", "aria-hidden": true, style: { height } },
    cell: { className: "data-table__spacer-cell", colSpan: colCount, style: { height } },
  };
}

// ─── Internals ───────────────────────────────────────────────────────────────

/**
 * Pinned columns are `position: sticky` inside the scroll viewport — which works
 * in a table, unlike every layout hack the grid-based approaches need.
 */
function stickyStyle(sticky: StickyPosition | undefined): TableStyle | undefined {
  if (!sticky) return undefined;
  return sticky.side === "left"
    ? { position: "sticky", left: sticky.offset }
    : { position: "sticky", right: sticky.offset };
}
