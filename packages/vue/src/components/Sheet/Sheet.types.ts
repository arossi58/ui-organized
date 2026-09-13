import type { SheetVariants } from "@ui-organized/core";

export interface SheetProps {
  /** Open state. Use `v-model:open` for two-way binding. */
  open?: boolean;
  /** Initial open state for uncontrolled usage. */
  defaultOpen?: boolean;
  /** Trap focus and block outside interaction while open. Defaults to true. */
  modal?: boolean;
}

export interface SheetContentProps {
  /** Edge the panel slides in from. Defaults to 'right'. */
  side?: NonNullable<SheetVariants["side"]>;
  /** Panel extent (width for left/right, height for top/bottom). Defaults to 'md'. */
  size?: NonNullable<SheetVariants["size"]>;
  /** Render a close (x) button in the top-right corner. Defaults to true. */
  showClose?: boolean;
  /** DOM element to teleport into. Defaults to `body`. */
  container?: HTMLElement | null;
}
