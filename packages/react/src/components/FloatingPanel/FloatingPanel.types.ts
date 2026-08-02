import type * as React from "react";
import type { RefObject } from "react";

export interface FloatingPanelProps {
  /** Controlled open state. */
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
  defaultSize?: { width: number; height: number };
  /** Smallest size the panel can be resized to. */
  minSize?: { width: number; height: number };
  /** Largest size the panel can be resized to. */
  maxSize?: { width: number; height: number };
  /** Initial position in pixels, relative to the positioning strategy. */
  defaultPosition?: { x: number; y: number };
  /**
   * Positioning strategy. Use `absolute` when the panel must stay inside a
   * scrolling container rather than the viewport. Defaults to 'fixed'.
   */
  strategy?: "absolute" | "fixed";
  children?: React.ReactNode;
}

export interface FloatingPanelTriggerProps
  extends React.ComponentPropsWithRef<"button"> {
  children?: React.ReactNode;
}

export interface FloatingPanelContentProps {
  /** Size variant, driving the panel's default width. Defaults to 'md'. */
  size?: "sm" | "md" | "lg";
  /** Surface treatment. `elevated` adds a shadow. Defaults to 'default'. */
  variant?: "default" | "elevated";
  /** Portal target for the panel. Defaults to the document body. */
  container?: RefObject<HTMLElement | null>;
  className?: string;
  children?: React.ReactNode;
}

export interface FloatingPanelHeaderProps extends React.ComponentPropsWithRef<"div"> {
  children?: React.ReactNode;
}

export interface FloatingPanelTitleProps
  extends React.ComponentPropsWithRef<"h2"> {
  children?: React.ReactNode;
}

export interface FloatingPanelBodyProps extends React.ComponentPropsWithRef<"div"> {
  children?: React.ReactNode;
}

export interface FloatingPanelCloseProps
  extends React.ComponentPropsWithRef<"button"> {
  children?: React.ReactNode;
}
