export interface FloatingPanelSize {
  width: number;
  height: number;
}

export interface FloatingPanelPosition {
  x: number;
  y: number;
}

export interface FloatingPanelProps {
  /** Open state. Use `v-model:open` for two-way binding. */
  open?: boolean;
  /** Initial open state for the uncontrolled case. */
  defaultOpen?: boolean;
  /** Allows dragging the panel by its header. Defaults to true. */
  draggable?: boolean;
  /** Allows resizing the panel from its edges. Defaults to true. */
  resizable?: boolean;
  /** Initial size in pixels. */
  defaultSize?: FloatingPanelSize;
  /** Smallest size the panel can be resized to. */
  minSize?: FloatingPanelSize;
  /** Largest size the panel can be resized to. */
  maxSize?: FloatingPanelSize;
  /** Initial position in pixels, relative to the positioning strategy. */
  defaultPosition?: FloatingPanelPosition;
  /**
   * Positioning strategy. Use `absolute` when the panel must stay inside a
   * scrolling container rather than the viewport. Defaults to 'fixed'.
   */
  strategy?: "absolute" | "fixed";
}

export interface FloatingPanelContentProps {
  /** Size variant, driving the panel's default width. Defaults to 'md'. */
  size?: "sm" | "md" | "lg";
  /** Surface treatment. `elevated` adds a shadow. Defaults to 'default'. */
  variant?: "default" | "elevated";
  /** DOM element to teleport the panel into. Defaults to `body`. */
  container?: HTMLElement | null;
}
