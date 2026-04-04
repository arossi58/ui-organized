import type * as React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Color variant. Defaults to 'default'. */
  variant?: "default" | "success" | "warning" | "error" | "info";
  /** Size variant. Defaults to 'md'. */
  size?: "sm" | "md";
  children?: React.ReactNode;
}
