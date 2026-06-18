import type * as React from "react";

/**
 * Field root props plus a layout variant. Hand-authored facade types (was
 * `ComponentProps<typeof BaseField.*>`); the field state props map onto Ark UI's
 * Field.Root.
 */
export interface FieldProps extends React.ComponentPropsWithoutRef<"div"> {
  /** Marks the field invalid (drives error display + `data-invalid`). */
  invalid?: boolean;
  /** Disables the field's control. */
  disabled?: boolean;
  /** Marks the field's control required. */
  required?: boolean;
  /** Marks the field's control read-only. */
  readOnly?: boolean;
  /** Arrangement of label and control. Defaults to 'stacked'. */
  layout?: "stacked" | "inline";
}

export type FieldLabelProps = React.ComponentPropsWithoutRef<"label">;
export type FieldDescriptionProps = React.ComponentPropsWithoutRef<"span">;
export type FieldControlProps = React.ComponentPropsWithoutRef<"input">;
export type FieldErrorMessageProps = React.ComponentPropsWithoutRef<"span">;
export type FieldsetProps = React.ComponentPropsWithoutRef<"fieldset">;
export type FieldsetLegendProps = React.ComponentPropsWithoutRef<"legend">;
