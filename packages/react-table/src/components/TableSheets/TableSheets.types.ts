import type { ButtonHTMLAttributes } from "react";
import type { IconComponent, IconName } from "@ui-organized/react";

export interface TableSheetButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: IconName | IconComponent;
  label: string;
  /** What is applied. Drawn as a badge from 1 up, and spoken as words. */
  count: number;
  /** The word the count is read with: "2 applied". */
  unit: string;
}

export interface TableSortSheetProps {
  /** Button label and sheet title. Defaults to "Sort". */
  label?: string;
  className?: string;
}

export interface TableFilterSheetProps {
  /** Button label and sheet title. Defaults to "Filter". */
  label?: string;
  className?: string;
}
