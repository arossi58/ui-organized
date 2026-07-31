import { useMemo, type ReactNode } from "react";
import {
  Field,
  Select as ArkSelect,
  Portal,
  createListCollection,
  useSelectContext,
} from "@ark-ui/react";
import { clsx } from "clsx";
import { selectFieldStyles } from "./Select.styles.js";
import { Icon } from "../Icon/index.js";
import { CONTROL_ICON_SIZE } from "../controlSize.js";
import { FieldError } from "../FieldError/index.js";
import { OMIT_ARIA, popupControls } from "../../utils/aria.js";
import type { SelectProps } from "./Select.types.js";
import "./Select.css";
import { useContainedPositioning, useOverlayPortal } from "../../preview/useOverlayPortal.js";

export function Select({
  options,
  value,
  defaultValue,
  onValueChange,
  open,
  defaultOpen,
  onOpenChange,
  placeholder,
  label,
  helperText,
  error,
  size,
  variant,
  disabled,
  name,
  required,
  className,
  portalContainer,
}: SelectProps) {
  const isInvalid = !!error;
  const errorMessage = typeof error === "string" ? error : undefined;
  const iconSize = CONTROL_ICON_SIZE[size ?? "md"];
  const portal = useOverlayPortal();
  const containedPositioning = useContainedPositioning();
  // The ghost variant shows no label. It still renders one — visually hidden —
  // because Ark names the trigger, the listbox and the hidden <select> after the
  // Label part, and an `aria-label` on the trigger alone can neither replace a
  // dangling reference nor reach the other two.
  const isGhost = variant === "ghost";

  // Ark drives the dropdown off a collection rather than children; build it from
  // the `options` array (label → display text, value → form value).
  const collection = useMemo(
    () =>
      createListCollection({
        items: options,
        itemToValue: (item) => item.value,
        itemToString: (item) => item.label,
        isItemDisabled: (item) => !!item.disabled,
      }),
    [options],
  );

  return (
    <Field.Root
      className={clsx(selectFieldStyles({ size, variant }), className)}
      invalid={isInvalid}
      disabled={disabled}
    >
      {/* Ark Select.Root renders a wrapping <div>; `display:contents` keeps the
          label / trigger / helper as direct flex children of the field. */}
      <ArkSelect.Root
        className="select-field__control"
        collection={collection}
        value={value != null ? [value] : undefined}
        defaultValue={defaultValue != null ? [defaultValue] : undefined}
        onValueChange={
          onValueChange
            ? (details) => {
                const next = details.value[0];
                if (next != null) onValueChange(next);
              }
            : undefined
        }
        open={open}
        defaultOpen={defaultOpen}
        onOpenChange={onOpenChange ? (details) => onOpenChange(details.open) : undefined}
        invalid={isInvalid}
        disabled={disabled}
        name={name}
        required={required}
        positioning={{ placement: "bottom-start", gutter: 4, strategy: "fixed", ...containedPositioning }}
      >
        {label && (
          <ArkSelect.Label className={isGhost ? "select-field__label--hidden" : "field__label"}>
            {label}
            {required && !isGhost && <span className="field__required" aria-hidden="true" />}
          </ArkSelect.Label>
        )}
        <SelectTrigger hasLabel={!!label}>
          <ArkSelect.ValueText className="select-field__value" placeholder={placeholder} />
          <ArkSelect.Indicator className="select-field__icon">
            <Icon name="chevron-down" size={iconSize} />
          </ArkSelect.Indicator>
        </SelectTrigger>
        {/* An explicitly-passed container still wins over the preview context. */}
        <Portal {...(portalContainer ? { container: { current: portalContainer } } : portal)}>
          <ArkSelect.Positioner className="select-positioner">
            <ArkSelect.Content
              className={clsx("select-popup", isGhost && "select-popup--ghost")}
              aria-labelledby={label ? undefined : OMIT_ARIA}
            >
              {/* Items sit directly in Content: with the default composite
                  select, Content *is* the listbox, and Select.List is a second
                  labelled wrapper meant for the non-composite mode. Between the
                  listbox and its options it counts as a child that isn't an
                  option, which a listbox may not have. */}
              {options.map((opt) => (
                <ArkSelect.Item key={opt.value} item={opt} className="select-popup__item text-default-body-large">
                  <ArkSelect.ItemText>{opt.label}</ArkSelect.ItemText>
                  <ArkSelect.ItemIndicator className="select-popup__item-indicator">
                    <Icon name="check" size={iconSize} />
                  </ArkSelect.ItemIndicator>
                </ArkSelect.Item>
              ))}
            </ArkSelect.Content>
          </ArkSelect.Positioner>
        </Portal>
        <ArkSelect.HiddenSelect aria-labelledby={label ? undefined : OMIT_ARIA} />
      </ArkSelect.Root>
      {helperText && !isInvalid && (
        <Field.HelperText className="field__description">{helperText}</Field.HelperText>
      )}
      {isInvalid && errorMessage && (
        <Field.ErrorText asChild>
          <FieldError>{errorMessage}</FieldError>
        </Field.ErrorText>
      )}
    </Field.Root>
  );
}

/**
 * The trigger, split out so it can read the select's open state from context —
 * `Select` itself renders the Root, so it sits above that context.
 */
function SelectTrigger({ hasLabel, children }: { hasLabel: boolean; children: ReactNode }) {
  return (
    <ArkSelect.Trigger
      className="select-field__trigger text-default-body-large"
      {...popupControls(useSelectContext().open)}
      // With no label anywhere there is no Label part to point at, so shed the
      // machine's reference rather than leave it dangling.
      aria-labelledby={hasLabel ? undefined : OMIT_ARIA}
    >
      {children}
    </ArkSelect.Trigger>
  );
}
