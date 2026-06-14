import type * as React from "react";

export interface FieldErrorProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** The error message to display. Renders nothing when empty. */
  children?: React.ReactNode;
}
