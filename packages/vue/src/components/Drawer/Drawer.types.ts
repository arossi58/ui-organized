export interface DrawerProps {
  /** Open state. Use `v-model:open` for two-way binding. */
  open?: boolean;
  /** Initial open state for uncontrolled usage. */
  defaultOpen?: boolean;
  /** Trap focus and block outside interaction while open. Defaults to true. */
  modal?: boolean;
}

export interface DrawerContentProps {
  /** Whether a press on the content can drag the panel. Defaults to true. The grabber always drags. */
  draggable?: boolean;
  /** The handle along the top edge, which always drags. Defaults to true. */
  showGrabber?: boolean;
  /** A close (x) button in the top-right corner. Defaults to true. */
  showClose?: boolean;
  /** DOM element to teleport into. Defaults to `body`. */
  container?: HTMLElement | null;
}
