import type * as React from "react";

export interface SpinnerProps extends React.HTMLAttributes<HTMLSpanElement> {
  /**
   * Edge length. sm, md and lg are 16, 20 and 24 px, the same as a control's
   * icon at that size; xl is 40 px, for a region loading on its own.
   * Defaults to 'md'.
   */
  size?: "sm" | "md" | "lg" | "xl";
  /**
   * What is loading, announced by assistive technology. Defaults to "Loading".
   * Name the thing when you can: "Loading results".
   */
  label?: string;
  /**
   * Hide the spinner from assistive technology, for when something else
   * already says the work is in progress, such as a Button's `loading` state,
   * which marks the button itself busy.
   */
  decorative?: boolean;
}
