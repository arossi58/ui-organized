import type { IconName } from "../Icon/Icon.types.js";
import type { IconComponent } from "../../icons/registry.js";

export interface SelectionCardOption {
  value: string;
  /** The card's title, and the option's accessible name. */
  label: string;
  /** A line under the title. It describes the option rather than naming it. */
  description?: string;
  /** An icon before the text: its native name, or a component. */
  icon?: IconName | IconComponent;
  disabled?: boolean;
}

export interface RadioCardGroupProps {
  /** The cards, one per option. */
  options: SelectionCardOption[];
  /** Selected value. Use `v-model` for two-way binding. */
  modelValue?: string;
  /** Initial selected value for uncontrolled usage. */
  defaultValue?: string;
  /** Group label rendered above the cards. */
  label?: string;
  /** Cards per row, 1 to 4. Defaults to 1, which stacks them. */
  columns?: 1 | 2 | 3 | 4;
  /** Card padding and type scale. Defaults to 'md'. */
  size?: "sm" | "md";
  /** Which side of the card the radio sits on. Defaults to 'end'. */
  indicator?: "start" | "end";
  /** Whether the entire group should ignore user interaction. */
  disabled?: boolean;
  /** Name attribute for form submission. */
  name?: string;
  /** A string shows an error message under the cards; `true` marks the group invalid without one. */
  error?: string | boolean;
  /**
   * Accessible name for the group when it has no visible `label`. Spelled
   * `ariaLabel`, as on RadioGroup; templates still write `aria-label="..."`.
   */
  ariaLabel?: string;
}
