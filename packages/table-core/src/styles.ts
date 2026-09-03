/**
 * The class contract and the numeric constants that have to agree with it.
 *
 * Class names are global and BEM-ish, exactly like the rest of the design
 * system's CSS, so a second framework adapter renders the same markup contract
 * without a second stylesheet.
 */
import { cva, type VariantProps } from "class-variance-authority";

export const dataTableStyles = cva("data-table", {
  variants: {
    size: {
      sm: "data-table--sm",
      md: "data-table--md",
      lg: "data-table--lg",
    },
    variant: {
      default: "data-table--default",
      bordered: "data-table--bordered",
    },
  },
  defaultVariants: {
    size: "md",
    variant: "default",
  },
});

export type DataTableVariants = VariantProps<typeof dataTableStyles>;

export const tableCellStyles = cva("data-table__cell", {
  variants: {
    align: {
      start: "data-table__cell--start",
      center: "data-table__cell--center",
      end: "data-table__cell--end",
    },
  },
  defaultVariants: { align: "start" },
});

export const tableHeadCellStyles = cva("data-table__head-cell", {
  variants: {
    align: {
      start: "data-table__head-cell--start",
      center: "data-table__head-cell--center",
      end: "data-table__head-cell--end",
    },
    sortable: {
      true: "data-table__head-cell--sortable",
      false: "",
    },
  },
  defaultVariants: { align: "start", sortable: false },
});

export type TableCellVariants = VariantProps<typeof tableCellStyles>;
export type TableHeadCellVariants = VariantProps<typeof tableHeadCellStyles>;

/**
 * Row height per size, in pixels.
 *
 * These MIRROR `--data-table-row-height` in `styles/table.css`, which is
 * expressed in tokens (`--control-height-*` plus the cell's vertical padding).
 * They exist because the virtualizer needs a number before anything has been
 * laid out. They are only ever the *initial estimate*: every rendered row is
 * measured, so a theme that changes the token values corrects itself on the
 * first frame rather than mis-positioning the scroll content.
 */
export const ROW_HEIGHT: Record<"sm" | "md" | "lg", number> = {
  sm: 36,
  md: 48,
  lg: 56,
};

/** Header height per size, in pixels. Same mirror caveat as `ROW_HEIGHT`. */
export const HEADER_HEIGHT: Record<"sm" | "md" | "lg", number> = {
  sm: 36,
  md: 44,
  lg: 52,
};

/**
 * Initial card-height estimate, in pixels. Cards vary with content far more than
 * rows do, so this is only ever the first guess — every card is measured.
 */
export const CARD_HEIGHT = 148;

/** Below this many rows, virtualization costs more than it saves. */
export const VIRTUAL_THRESHOLD = 50;

/** Rows rendered beyond each edge of the viewport. */
export const OVERSCAN = 8;

/** Viewport width (px) below which `responsive: "auto"` switches to cards. */
export const CARD_BREAKPOINT = 640;

export const DEFAULT_PAGE_SIZE = 25;

export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

/** Default column width when neither the column nor the consumer sets one. */
export const DEFAULT_COLUMN_WIDTH = 160;
export const MIN_COLUMN_WIDTH = 64;
export const MAX_COLUMN_WIDTH = 800;

/** Keyboard resize steps, in pixels. Shift is the fine-grained one. */
export const RESIZE_STEP = 8;
export const RESIZE_STEP_FINE = 1;
