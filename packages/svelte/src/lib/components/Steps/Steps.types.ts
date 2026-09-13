import type { Snippet } from "svelte";
import type { ControlSize } from "@ui-organized/core";

export interface StepItem {
  /** Step heading. */
  title: string;
  /** Optional supporting line under the title. */
  description?: string;
  /**
   * Panel shown while this step is current. A string, or a snippet for anything
   * richer.
   *
   * React takes a ReactNode here, which can be either. Svelte has no single type
   * that covers both, so the union is explicit and the component renders
   * whichever it was given.
   */
  content?: string | Snippet;
}

export interface StepsProps {
  /** The steps, in order. */
  steps: StepItem[];
  /** Index of the current step. Bindable: `bind:step`. */
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
  size?: ControlSize;
  /** Indicator style. `numbered` shows the step number, `dotted` a plain dot. Defaults to 'numbered'. */
  variant?: "numbered" | "dotted";
  /** Prevents jumping ahead past the current step. Defaults to false. */
  linear?: boolean;
  /** Renders the step panels and the previous/next buttons. Defaults to true. */
  showContent?: boolean;
  /** Panel shown once every step is complete. */
  completedContent?: string | Snippet;
  class?: string;
}
