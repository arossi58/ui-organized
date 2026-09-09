import type { Snippet } from "svelte";
import type { HTMLAttributes, HTMLButtonAttributes } from "svelte/elements";
import type { ArkForwardable } from "../../types.js";

/**
 * Every interface here states its own members rather than extending a shared
 * base: `svelte-package` emits no `.d.ts` for props whose type extends an
 * interface it cannot see, and it fails silently — the build succeeds and
 * consumers get `any`.
 */

export interface FloatingPanelSize {
  width: number;
  height: number;
}

export interface FloatingPanelPosition {
  x: number;
  y: number;
}

export interface FloatingPanelProps {
  /** Open state. Bindable: `bind:open`. */
  open?: boolean;
  /** Initial open state for the uncontrolled case. */
  defaultOpen?: boolean;
  /** Called when the panel opens or closes. */
  onOpenChange?: (open: boolean) => void;
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
  children?: Snippet;
}

export interface FloatingPanelTriggerProps
  extends ArkForwardable<Omit<HTMLButtonAttributes, "class" | "value">> {
  class?: string;
  children?: Snippet;
}

export interface FloatingPanelContentProps {
  /** Size variant, driving the panel's default width. Defaults to 'md'. */
  size?: "sm" | "md" | "lg";
  /** Surface treatment. `elevated` adds a shadow. Defaults to 'default'. */
  variant?: "default" | "elevated";
  /** Portal container for the panel. Defaults to document.body. */
  container?: HTMLElement | null;
  class?: string;
  children?: Snippet;
}

export interface FloatingPanelHeaderProps
  extends ArkForwardable<Omit<HTMLAttributes<HTMLDivElement>, "class">> {
  class?: string;
  children?: Snippet;
}

export interface FloatingPanelTitleProps
  extends ArkForwardable<Omit<HTMLAttributes<HTMLHeadingElement>, "class">> {
  class?: string;
  children?: Snippet;
}

export interface FloatingPanelBodyProps
  extends ArkForwardable<Omit<HTMLAttributes<HTMLDivElement>, "class">> {
  class?: string;
  children?: Snippet;
}

export interface FloatingPanelCloseProps
  extends ArkForwardable<Omit<HTMLButtonAttributes, "class" | "value">> {
  class?: string;
  children?: Snippet;
}
