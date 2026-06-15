// DateInput reuses the Input field's wrapper/size variants verbatim — the same
// `.input-field` / `.input-field--{sm,md,lg}` classes drive the label, control
// surface, states and padding (see Input.css). Re-exporting keeps a single
// source of truth for the variant config.
export { inputFieldStyles as dateInputFieldStyles } from "../Input/Input.styles.js";
export type { InputVariants as DateInputVariants } from "../Input/Input.styles.js";
