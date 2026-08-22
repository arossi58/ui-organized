import type { Snippet } from "svelte";
import type { HTMLAttributes, HTMLInputAttributes, HTMLLabelAttributes } from "svelte/elements";
import type { ArkForwardable } from "../../types.js";
export interface FieldProps extends ArkForwardable<Omit<HTMLAttributes<HTMLDivElement>, "class">> {
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
    class?: string;
    children?: Snippet;
}
interface PartProps<T extends HTMLElement = HTMLElement> {
    class?: string;
    children?: Snippet;
    id?: string;
}
export interface FieldLabelProps extends ArkForwardable<Omit<HTMLLabelAttributes, "class">>, PartProps {
}
export interface FieldDescriptionProps extends ArkForwardable<Omit<HTMLAttributes<HTMLSpanElement>, "class">>, PartProps {
}
export interface FieldControlProps extends ArkForwardable<Omit<HTMLInputAttributes, "class">>, PartProps {
    /** The control's value. Bindable: `bind:value`. */
    value?: string | number | null;
}
export interface FieldErrorMessageProps extends ArkForwardable<Omit<HTMLAttributes<HTMLSpanElement>, "class">>, PartProps {
    /** Message as a plain string — see FieldError for why a snippet is not enough. */
    message?: string;
}
export interface FieldsetProps extends ArkForwardable<Omit<HTMLAttributes<HTMLFieldSetElement>, "class">>, PartProps {
}
export interface FieldsetLegendProps extends ArkForwardable<Omit<HTMLAttributes<HTMLLegendElement>, "class">>, PartProps {
}
export {};
//# sourceMappingURL=Field.types.d.ts.map