import type { ReactNode } from "react";
import type { TableAction } from "../../core/types.js";

export interface TableToolbarProps {
  /** Replaces the default arrangement entirely. */
  children?: ReactNode;
  className?: string;
}

export interface TableSearchProps {
  placeholder?: string;
  /** Accessible name. Defaults to "Search <table label>". */
  label?: string;
  className?: string;
}

export interface TableViewOptionsProps {
  label?: string;
  className?: string;
}

export interface TableExportMenuProps {
  label?: string;
  className?: string;
}

export interface TableActionsProps {
  /** Overrides `options.actions`. */
  actions?: TableAction[];
  className?: string;
}

export interface TableScrollButtonsProps {
  /** Accessible name for the left button. Defaults to "Scroll left". */
  leftLabel?: string;
  /** Accessible name for the right button. Defaults to "Scroll right". */
  rightLabel?: string;
  className?: string;
}

export interface TableSortMenuProps {
  /** Accessible name for the icon-only trigger. Defaults to "Sort". */
  label?: string;
  className?: string;
}
