import { useMemo, useState } from "react";
import {
  Combobox as ArkCombobox,
  Field,
  Portal,
  createListCollection,
  useFilter,
} from "@ark-ui/react";
import { clsx } from "clsx";
import { comboboxFieldStyles } from "./Combobox.styles.js";
import { Icon } from "../Icon/index.js";
import { CONTROL_ICON_SIZE } from "../controlSize.js";
import { FieldError } from "../FieldError/index.js";
import type { ComboboxProps } from "./Combobox.types.js";
import "./Combobox.css";
import { useContainedPositioning, useOverlayPortal } from "../../preview/useOverlayPortal.js";

// Module-level so `useFilter`'s memo key is stable (it keys on the props object
// identity); otherwise `contains` — and the derived collection — would churn
// every render.
const FILTER_OPTIONS = { sensitivity: "base" } as const;

export function Combobox({
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
  disabled,
  name,
  required,
  className,
  emptyMessage = "No results found.",
  portalContainer,
}: ComboboxProps) {
  const isInvalid = !!error;
  const errorMessage = typeof error === "string" ? error : undefined;
  const portal = useOverlayPortal();
  const containedPositioning = useContainedPositioning();

  // Ark doesn't filter for us (Base UI did): mirror the input text and rebuild
  // the collection from the matching options. Rendering items from
  // `collection.items` keeps the rendered list and the machine's collection in
  // sync.
  const { contains } = useFilter(FILTER_OPTIONS);
  const [query, setQuery] = useState("");
  const collection = useMemo(() => {
    const items = query.trim().length
      ? options.filter((o) => contains(o.label, query))
      : options;
    return createListCollection({
      items,
      itemToValue: (o) => o.value,
      itemToString: (o) => o.label,
      isItemDisabled: (o) => !!o.disabled,
    });
  }, [options, query, contains]);

  return (
    <Field.Root
      className={clsx(comboboxFieldStyles({ size }), className)}
      invalid={isInvalid}
      disabled={disabled}
    >
      {/* Ark Combobox.Root renders a wrapping <div>; `display:contents` keeps the
          label / control / helper as direct flex children of the field. */}
      <ArkCombobox.Root
        className="combobox-field__root"
        collection={collection}
        value={value != null ? [value] : undefined}
        defaultValue={defaultValue != null ? [defaultValue] : undefined}
        onValueChange={
          onValueChange ? (details) => onValueChange(details.value[0] ?? "") : undefined
        }
        onInputValueChange={(details) => setQuery(details.inputValue)}
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
          <ArkCombobox.Label className="field__label">
            {label}
            {required && <span className="field__required" aria-hidden="true" />}
          </ArkCombobox.Label>
        )}
        <ArkCombobox.Control className="combobox-field__control">
          <ArkCombobox.Input
            className="field__control combobox-field__input"
            placeholder={placeholder}
          />
          <ArkCombobox.Trigger className="combobox-field__trigger" aria-label="Toggle options">
            <Icon name="chevron-down" size={CONTROL_ICON_SIZE[size ?? "md"]} />
          </ArkCombobox.Trigger>
        </ArkCombobox.Control>
        {/* An explicitly-passed container still wins over the preview context. */}
        <Portal {...(portalContainer ? { container: { current: portalContainer } } : portal)}>
          <ArkCombobox.Positioner className="combobox-positioner">
            <ArkCombobox.Content className="combobox-popup">
              <ArkCombobox.Empty className="combobox-popup__empty text-default-body-medium">{emptyMessage}</ArkCombobox.Empty>
              {/* Items sit directly in Content, which is itself the listbox —
                  Combobox.List is a second labelled wrapper for the
                  non-composite mode, and in between it reads as a child of the
                  listbox that isn't an option. */}
              {collection.items.map((item) => (
                <ArkCombobox.Item key={item.value} item={item} className="combobox-popup__item text-default-body-large">
                  <span className="combobox-popup__item-label">{item.label}</span>
                  <ArkCombobox.ItemIndicator className="combobox-popup__item-indicator">
                    <Icon name="check" size={CONTROL_ICON_SIZE[size ?? "md"]} />
                  </ArkCombobox.ItemIndicator>
                </ArkCombobox.Item>
              ))}
            </ArkCombobox.Content>
          </ArkCombobox.Positioner>
        </Portal>
      </ArkCombobox.Root>
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
