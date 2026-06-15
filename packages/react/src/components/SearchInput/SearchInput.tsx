import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { Field } from "@base-ui-components/react/field";
import { clsx } from "clsx";
import { searchInputFieldStyles } from "./SearchInput.styles.js";
import { Icon } from "../Icon/index.js";
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
        <Field.Label className="input-field__label">
          {label}
          {required && <span className="input-field__required" aria-hidden="true" />}
        </Field.Label>
      )}
      <div className="input-affix">
        <span
          className="input-affix__adornment input-affix__adornment--start"
          aria-hidden="true"
        >
          <Icon name="search" size={20} />
        </span>
        <Field.Control
          render={<input ref={inputRef} type="search" />}
          className={clsx(
            "input-field__control",
            "input-field__control--affix-start",
            showClear && "input-field__control--affix-end",
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
            <Icon name="close" size={20} />
          </button>
        )}
      </div>
      {helperText && !isInvalid && (
        <Field.Description className="input-field__description">
          {helperText}
        </Field.Description>
      )}
      {isInvalid && errorMessage && (
        <Field.Error match={true} render={<FieldError />}>
          {errorMessage}
        </Field.Error>
      )}
    </Field.Root>
  );
}
