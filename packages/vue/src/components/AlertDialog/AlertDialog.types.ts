export interface AlertDialogProps {
  /** Open state. Use `v-model:open` for two-way binding. */
  open?: boolean;
  /** Initial open state for uncontrolled usage. */
  defaultOpen?: boolean;
}

export interface AlertDialogContentProps {
  /** Width preset. Defaults to 'sm'. */
  size?: "sm" | "md" | "lg" | "fullscreen";
  /** Render a close (x) button. Defaults to false — confirm with the actions. */
  showClose?: boolean;
  /** DOM element to teleport into. Defaults to `body`. */
  container?: HTMLElement | null;
}

export interface AlertDialogConfirmProps {
  /** Button intent. Defaults to 'primary'. Use 'destructive' for dangerous actions. */
  intent?: "primary" | "destructive";
}
