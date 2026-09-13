import type { CanonicalIconName } from "@ui-organized/utils";

export interface ContextMenuProps {
  /** Open state. Use `v-model:open` for two-way binding. */
  open?: boolean;
  /** Initial open state for uncontrolled usage. */
  defaultOpen?: boolean;
}

export interface ContextMenuContentProps {
  /** Gap from the cursor, in px. Defaults to 4. */
  sideOffset?: number;
  /** Offset along the alignment axis, in px. */
  alignOffset?: number;
  /** DOM element to teleport into. Defaults to `body`. */
  container?: HTMLElement | null;
}

export interface ContextMenuItemProps {
  /** Stable value for the item. Generated when omitted. */
  value?: string;
  /** Icon rendered before the label. */
  icon?: CanonicalIconName;
  /** Renders the item in the destructive colour. */
  destructive?: boolean;
  /** Prevents selection while keeping the item visible. */
  disabled?: boolean;
}

export interface ContextMenuCheckboxItemProps {
  value?: string;
  checked?: boolean;
  disabled?: boolean;
}

export interface ContextMenuRadioItemProps {
  value: string;
  disabled?: boolean;
}

export interface ContextMenuRadioGroupProps {
  /** Selected value. Use `v-model` for two-way binding. */
  modelValue?: string;
}
