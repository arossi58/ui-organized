import type { TableFilterCondition } from "@ui-organized/table-core";

export interface TableFiltersProps {
  className?: string;
}

export interface TableFilterAddProps {
  /**
   * The trigger's label — shown beside the icon in the filter bar, and used as
   * the accessible name of the header's icon-only button. Defaults to
   * "Add filter".
   */
  label?: string;
  /** Render as the header's icon-only funnel rather than the bar's "＋ Add". */
  iconOnly?: boolean;
  className?: string;
}

export interface TableFilterChipProps {
  condition: TableFilterCondition;
  className?: string;
}

export interface TableFilterEditorProps {
  condition: TableFilterCondition;
  /**
   * The element a portalled popup must land inside.
   *
   * `Popover` is non-modal, so a `Select` portalled to `document.body` reads as
   * an outside click and dismisses the editor on the first interaction. The
   * same escape `Calendar` uses for its year picker inside a date popover.
   */
  portalContainer: HTMLElement | null;
}

export interface TableFilterValueEditorProps extends TableFilterEditorProps {
  /** How many operands the current operator takes. */
  arity: "none" | "one" | "two" | "many";
}
