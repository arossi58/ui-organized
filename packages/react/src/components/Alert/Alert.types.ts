import type * as React from "react";

export interface AlertProps {
  /** Semantic variant driving icon and color. Defaults to 'info'. */
  variant?: "info" | "success" | "warning" | "error";
  /** Optional title text rendered above the message. */
  title?: string;
  /** The alert message content. */
  children: React.ReactNode;
  /** Callback fired when the dismiss button is clicked. If omitted, no button is shown. */
  onDismiss?: () => void;
  className?: string;
}
