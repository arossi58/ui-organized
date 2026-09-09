import type { CanonicalIconName } from "@ui-organized/utils";

export type MenuSide = "top" | "right" | "bottom" | "left";
export type MenuAlign = "start" | "center" | "end";

export interface MenuProps {
  /** Open state. Use `v-model:open` for two-way binding. */
  open?: boolean;
  /** Initial open state for uncontrolled usage. */
  defaultOpen?: boolean;
}

export interface MenuContentProps {
  /** Side of the trigger to position against. Defaults to 'bottom'. */
  side?: MenuSide;
  /** Alignment along the chosen side. Defaults to 'start'. */
  align?: MenuAlign;
  /** Gap between trigger and popup, in px. Defaults to 4. */
  sideOffset?: number;
  /** Offset along the alignment axis, in px. */
  alignOffset?: number;
  /** DOM element to teleport into. Defaults to `body`. */
  container?: HTMLElement | null;
}

export interface MenuItemProps {
  /** Icon rendered before the label. */
  icon?: CanonicalIconName;
  /** Renders the item in the destructive colour. */
  destructive?: boolean;
  /** Stable value for the item. Generated when omitted. */
  value?: string;
  /** Disable the item. */
  disabled?: boolean;
}

export interface MenuCheckboxItemProps {
  value?: string;
  checked?: boolean;
  /** Disable the item. */
  disabled?: boolean;
}

export interface MenuRadioItemProps {
  value: string;
  /** Disable the item. */
  disabled?: boolean;
}

export interface MenuRadioGroupProps {
  /** Selected value. Use `v-model` for two-way binding. */
  modelValue?: string;
}
