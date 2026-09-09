export interface DialogProps {
  /** Open state. Use `v-model:open` for two-way binding. */
  open?: boolean;
  /** Initial open state for uncontrolled usage. */
  defaultOpen?: boolean;
  /** Trap focus and block outside interaction while open. */
  modal?: boolean;
}

export interface DialogContentProps {
  /** Width preset. Defaults to 'md'. */
  size?: "sm" | "md" | "lg" | "fullscreen";
  /** Render a close (x) button in the top-right corner. Defaults to true. */
  showClose?: boolean;
  /** DOM element to teleport into. Defaults to `body`. */
  container?: HTMLElement | null;
}
