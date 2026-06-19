import type * as React from "react";

/**
 * Root of a single disclosure section. Controlled via `open` + `onOpenChange`,
 * or uncontrolled via `defaultOpen`.
 */
export interface CollapsibleProps
  extends Omit<React.ComponentPropsWithoutRef<"div">, "onChange" | "dir"> {
  /** Whether the panel is open (controlled). */
  open?: boolean;
  /** Initial open state for uncontrolled usage. */
  defaultOpen?: boolean;
  /** Fired with the next open state whenever it changes. */
  onOpenChange?: (open: boolean) => void;
  /** Disable the trigger and prevent toggling. */
  disabled?: boolean;
}

/** Toggle button. Pass `render` to project a custom element (mapped to `asChild`). */
export interface CollapsibleTriggerProps
  extends React.ComponentPropsWithoutRef<"button"> {
  /** Project the trigger onto a custom element instead of the default `<button>`. */
  render?: React.ReactElement;
}

/** Revealed region. Its height animates between `0` and its measured size. */
export interface CollapsibleContentProps
  extends React.ComponentPropsWithoutRef<"div"> {
  /** Project the panel onto a custom element instead of the default `<div>`. */
  render?: React.ReactElement;
}
