import { Field as ArkField, Fieldset as ArkFieldset } from "@ark-ui/react";
import { clsx } from "clsx";
import { fieldStyles } from "./Field.styles.js";
import { FieldError } from "../FieldError/index.js";
import type {
  FieldProps,
  FieldLabelProps,
  FieldDescriptionProps,
  FieldControlProps,
  FieldErrorMessageProps,
  FieldsetProps,
  FieldsetLegendProps,
} from "./Field.types.js";
import "./Field.css";

/**
 * Form field wrapper. Associates a label, control, description and error message
 * through Ark UI's Field, so validation state flows to all parts via
 * `aria-describedby` / `[data-invalid]`.
 */
export function Field({ layout, className, ...props }: FieldProps) {
  return (
    <ArkField.Root className={clsx(fieldStyles({ layout }), className)} {...props} />
  );
}

/** Label for the field's control. Also exported standalone as `Label`. */
export function FieldLabel({ className, ...props }: FieldLabelProps) {
  return <ArkField.Label className={clsx("field__label", className)} {...props} />;
}

export function FieldDescription({ className, ...props }: FieldDescriptionProps) {
  return (
    <ArkField.HelperText className={clsx("field__description", className)} {...props} />
  );
}

export function FieldControl({ className, ...props }: FieldControlProps) {
  return <ArkField.Input className={clsx("field__control", className)} {...props} />;
}

/**
 * Error message wired to the field's validity. Renders through the shared
 * {@link FieldError} (icon + tinted pill). Ark's ErrorText shows only when the
 * Field is `invalid`, so it no longer needs Base UI's `match` prop.
 */
export function FieldErrorMessage({ children, className, ...props }: FieldErrorMessageProps) {
  return (
    <ArkField.ErrorText asChild>
      <FieldError className={className} {...props}>
        {children}
      </FieldError>
    </ArkField.ErrorText>
  );
}

/** Groups related fields under a shared legend. */
export function Fieldset({ className, ...props }: FieldsetProps) {
  return <ArkFieldset.Root className={clsx("fieldset", className)} {...props} />;
}

export function FieldsetLegend({ className, ...props }: FieldsetLegendProps) {
  return <ArkFieldset.Legend className={clsx("fieldset__legend", className)} {...props} />;
}

export { FieldLabel as Label };
