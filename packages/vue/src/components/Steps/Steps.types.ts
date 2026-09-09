import type { Component } from "vue";
import type { ControlSize } from "@ui-organized/core";

export interface StepItem {
  /** Step heading. */
  title: string;
  /** Optional supporting line under the title. */
  description?: string;
  /** Panel shown while this step is current. A string, or a component for anything richer. */
  content?: string | Component;
}

export interface StepsProps {
  /** The steps, in order. */
  steps: StepItem[];
  /** Index of the current step. Use `v-model:step` for two-way binding. */
  step?: number;
  /** Initial step index for the uncontrolled case. Defaults to 0. */
  defaultStep?: number;
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
  completedContent?: string | Component;
}
