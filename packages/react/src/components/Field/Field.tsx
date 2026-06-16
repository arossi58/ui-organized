import { Field as BaseField } from "@base-ui-components/react/field";
import { Fieldset as BaseFieldset } from "@base-ui-components/react/fieldset";
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
 * through Base UI's Field, so validation state flows to all parts via
 * `aria-describedby` / `[data-invalid]`.
 */
export function Field({ layout, className, ...props }: FieldProps) {
  return (
    <BaseField.Root className={clsx(fieldStyles({ layout }), className)} {...props} />
  );
}

/** Label for the field's control. Also exported standalone as `Label`. */
export function FieldLabel({ className, ...props }: FieldLabelProps) {
  return <BaseField.Label className={clsx("field__label", className)} {...props} />;
}

export function FieldDescription({ className, ...props }: FieldDescriptionProps) {
  return (
    <BaseField.Description className={clsx("field__description", className)} {...props} />
  );
}

export function FieldControl({ className, ...props }: FieldControlProps) {
  return <BaseField.Control className={clsx("field__control", className)} {...props} />;
}

/**
 * Error message wired to the field's validity. Renders through the shared
 * {@link FieldError} (icon + tinted pill). Pass `match` to force visibility.
 */
export function FieldErrorMessage({ children, ...props }: FieldErrorMessageProps) {
  return (
    <BaseField.Error render={<FieldError />} {...props}>
      {children}
    </BaseField.Error>
  );
}

/** Groups related fields under a shared legend. */
export function Fieldset({ className, ...props }: FieldsetProps) {
  return <BaseFieldset.Root className={clsx("fieldset", className)} {...props} />;
}

export function FieldsetLegend({ className, ...props }: FieldsetLegendProps) {
  return <BaseFieldset.Legend className={clsx("fieldset__legend", className)} {...props} />;
}

export { FieldLabel as Label };
