import type * as React from "react";

export interface StepItem {
  /** Step heading. */
  title: string;
  /** Optional supporting line under the title. */
  description?: string;
  /** Panel shown while this step is current. */
  content?: React.ReactNode;
}

export interface StepsProps {
  /** The steps, in order. */
  steps: StepItem[];
  /** Controlled index of the current step. */
  step?: number;
  /** Initial step index for the uncontrolled case. Defaults to 0. */
  defaultStep?: number;
  /** Called with the new index whenever the current step changes. */
  onStepChange?: (step: number) => void;
  /** Called once the last step is completed. */
  onStepComplete?: () => void;
  /** Layout direction. Defaults to 'horizontal'. */
  orientation?: "horizontal" | "vertical";
  /** Size variant. Defaults to 'md'. */
  size?: "sm" | "md" | "lg";
  /** Indicator style. `numbered` shows the step number, `dotted` a plain dot. Defaults to 'numbered'. */
  variant?: "numbered" | "dotted";
  /** Prevents jumping ahead past the current step. Defaults to false. */
  linear?: boolean;
  /** Renders the step panels and the previous/next buttons. Defaults to true. */
  showContent?: boolean;
  /** Panel shown once every step is complete. */
  completedContent?: React.ReactNode;
  className?: string;
}
