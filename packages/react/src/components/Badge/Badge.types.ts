import type * as React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Status color variant. */
  variant?: "success" | "info" | "info-secondary" | "caution" | "warning" | "error";
  /** Size variant. Defaults to 'md'. */
  size?: "sm" | "md" | "lg";
  /**
   * When true (default), renders a solid filled badge with primary text.
   * When false, renders a subdued dark-background badge with colored text.
   */
  emphasized?: boolean;
  children?: React.ReactNode;
}
