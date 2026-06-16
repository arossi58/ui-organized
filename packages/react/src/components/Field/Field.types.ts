import type * as React from "react";
import { Field as BaseField } from "@base-ui-components/react/field";
import { Fieldset as BaseFieldset } from "@base-ui-components/react/fieldset";

/** Field root props plus a layout variant. Forwards all Base UI Field.Root props. */
export interface FieldProps extends React.ComponentProps<typeof BaseField.Root> {
  /** Arrangement of label and control. Defaults to 'stacked'. */
  layout?: "stacked" | "inline";
}

export type FieldLabelProps = React.ComponentProps<typeof BaseField.Label>;
export type FieldDescriptionProps = React.ComponentProps<typeof BaseField.Description>;
export type FieldControlProps = React.ComponentProps<typeof BaseField.Control>;
export type FieldErrorMessageProps = React.ComponentProps<typeof BaseField.Error>;
export type FieldsetProps = React.ComponentProps<typeof BaseFieldset.Root>;
export type FieldsetLegendProps = React.ComponentProps<typeof BaseFieldset.Legend>;
