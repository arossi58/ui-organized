import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { Field } from "@ark-ui/react";
import { clsx } from "clsx";
import { searchInputFieldStyles } from "./SearchInput.styles.js";
import { Icon } from "../Icon/index.js";
import { CONTROL_ICON_SIZE } from "../controlSize.js";
import { FieldError } from "../FieldError/index.js";
import type { SearchInputProps } from "./SearchInput.types.js";
// Shares the Input field surface/state styling; InputAffix.css layers on the
// leading icon and clear button.
import "../Input/Input.css";
import "../Input/InputAffix.css";

export function SearchInput({
  label,
  helperText,
  error,
  size,
  required,
  clearable = true,
  onClear,
  className,
  value,
  defaultValue,
  disabled,
  onChange,
  ...inputProps
}: SearchInputProps) {
  const isInvalid = !!error;
  const errorMessage = typeof error === "string" ? error : undefined;

  const inputRef = useRef<HTMLInputElement>(null);
  const isControlled = value !== undefined;
  const [hasValue, setHasValue] = useState(
    () => String((isControlled ? value : defaultValue) ?? "").length > 0,
  );

  // Keep the clear button in sync when the value is driven from the outside.
  useEffect(() => {
    if (isControlled) setHasValue(String(value ?? "").length > 0);
  }, [isControlled, value]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (!isControlled) setHasValue(event.target.value.length > 0);
    onChange?.(event);
  };

  const handleClear = () => {
    const input = inputRef.current;
    if (input) {
      // Clear through the native value setter and dispatch an input event so
      // React's onChange fires for both controlled and uncontrolled usage.
      const setNativeValue = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        "value",
      )?.set;
      setNativeValue?.call(input, "");
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.focus();
    }
    if (!isControlled) setHasValue(false);
    onClear?.();
  };

  const showClear = clearable && hasValue && !disabled;

  return (
    <Field.Root
      className={clsx(searchInputFieldStyles({ size }), className)}
      invalid={isInvalid}
    >
      {label && (
        <Field.Label className="field__label">
          {label}
          {required && <span className="field__required" aria-hidden="true" />}
        </Field.Label>
      )}
      <div className="input-affix">
        <span
          className="input-affix__adornment input-affix__adornment--start"
          aria-hidden="true"
        >
          <Icon name="search" size={CONTROL_ICON_SIZE[size ?? "md"]} />
        </span>
        <Field.Input
          ref={inputRef}
          type="search"
          className={clsx(
            "field__control",
            "field__control--affix-start",
            showClear && "field__control--affix-end",
          )}
          required={required}
          disabled={disabled}
          value={value}
          defaultValue={defaultValue}
          onChange={handleChange}
          {...inputProps}
        />
        {showClear && (
          <button
            type="button"
            className="input-affix__adornment input-affix__adornment--end input-affix__action"
            onClick={handleClear}
            aria-label="Clear search"
            tabIndex={-1}
          >
            <Icon name="close" size={CONTROL_ICON_SIZE[size ?? "md"]} />
          </button>
        )}
      </div>
      {helperText && !isInvalid && (
        <Field.HelperText className="field__description">
          {helperText}
        </Field.HelperText>
      )}
      {isInvalid && errorMessage && (
        <Field.ErrorText asChild>
          <FieldError>{errorMessage}</FieldError>
        </Field.ErrorText>
      )}
    </Field.Root>
  );
}
