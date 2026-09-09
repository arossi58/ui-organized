import type { TableRowModel, RowData } from "@ui-organized/table-core";

export interface TableCardsProps {
  className?: string;
}

export interface TableCardProps<T extends RowData> {
  row: TableRowModel<T>;
  /** Index within the current page. */
  index: number;
  /** Column ids to show as fields, already ordered by `meta.priority`. */
  fields: string[];
  measureElement?: (element: HTMLElement | null) => void;
  className?: string;
}
