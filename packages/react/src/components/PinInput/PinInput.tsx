import { PinInput as ArkPinInput } from "@ark-ui/react";
import { clsx } from "clsx";
import { FieldError } from "../FieldError/index.js";
import { pinInputStyles } from "./PinInput.styles.js";
import type { PinInputProps } from "./PinInput.types.js";
import "./PinInput.css";

const DEFAULT_LENGTH = 4;

/** The machine models the value as one string per cell; the public API is the
 *  whole code as a single string. Same boundary coercion `Select` does for
 *  `string ↔ string[]`, for the same reason: the array is an implementation
 *  detail of the parts, not something a caller should have to assemble. */
function toCells(value: string | undefined, length: number): string[] | undefined {
  if (value == null) return undefined;
  return Array.from({ length }, (_, i) => value[i] ?? "");
}

export function PinInput({
  label,
  helperText,
  error,
  length = DEFAULT_LENGTH,
  size,
  variant,
  value,
  defaultValue,
  onValueChange,
  onValueComplete,
  type = "numeric",
  mask,
  otp,
  placeholder,
  blurOnComplete,
  required,
  disabled,
  readOnly,
  name,
  className,
}: PinInputProps) {
  const isInvalid = !!error;
  const errorMessage = typeof error === "string" ? error : undefined;

  return (
    <ArkPinInput.Root
      className={clsx(pinInputStyles({ size, variant }), className)}
      count={length}
      value={toCells(value, length)}
      defaultValue={toCells(defaultValue, length)}
      onValueChange={onValueChange && ((details) => onValueChange(details.value.join("")))}
      onValueComplete={onValueComplete && ((details) => onValueComplete(details.value.join("")))}
      type={type}
      mask={mask}
      otp={otp}
      placeholder={placeholder}
      blurOnComplete={blurOnComplete}
      invalid={isInvalid}
      required={required}
      disabled={disabled}
      readOnly={readOnly}
      name={name}
    >
      {label && (
        <ArkPinInput.Label className="field__label">
          {label}
          {required && <span className="field__required" aria-hidden="true" />}
        </ArkPinInput.Label>
      )}
      <ArkPinInput.Control className="pin-input__control">
        {Array.from({ length }, (_, index) => (
          <ArkPinInput.Input key={index} index={index} className="pin-input__cell" />
        ))}
      </ArkPinInput.Control>
      {helperText && !isInvalid && (
        <span className="field__description">{helperText}</span>
      )}
      {isInvalid && errorMessage && <FieldError>{errorMessage}</FieldError>}
      <ArkPinInput.HiddenInput />
    </ArkPinInput.Root>
  );
}
