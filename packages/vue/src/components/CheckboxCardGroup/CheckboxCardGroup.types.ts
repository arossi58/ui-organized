import type { SelectionCardOption } from "../RadioCardGroup/RadioCardGroup.types.js";

export type { SelectionCardOption };

export interface CheckboxCardGroupProps {
  /** The cards, one per option. */
  options: SelectionCardOption[];
  /** Checked values. Use `v-model` for two-way binding. */
  modelValue?: string[];
  /** Initial checked values for uncontrolled usage. */
  defaultValue?: string[];
  /** Group label rendered above the cards. */
  label?: string;
  /** Cards per row, 1 to 4. Defaults to 1, which stacks them. */
  columns?: 1 | 2 | 3 | 4;
  /** Card padding and type scale. Defaults to 'md'. */
  size?: "sm" | "md";
  /** Which side of the card the check box sits on. Defaults to 'end'. */
  indicator?: "start" | "end";
  /** Whether the entire group should ignore user interaction. */
  disabled?: boolean;
  /** Name attribute for form submission; each checked card submits its value. */
  name?: string;
  /** A string shows an error message under the cards; `true` marks the group invalid without one. */
  error?: string | boolean;
  /** Accessible name for the group when it has no visible `label`. */
  ariaLabel?: string;
}
