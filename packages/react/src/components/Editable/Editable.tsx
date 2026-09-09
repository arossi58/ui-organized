import { Editable as ArkEditable } from "@ark-ui/react";
import { clsx } from "clsx";
import { Button } from "../Button/index.js";
import { FieldError } from "../FieldError/index.js";
import { editableStyles } from "@ui-organized/core";
import type { EditableProps } from "./Editable.types.js";
import "@ui-organized/core/components/Editable/Editable.css";

export function Editable({
  label,
  helperText,
  error,
  value,
  defaultValue,
  onValueChange,
  onValueCommit,
  placeholder,
  size = "md",
  activationMode,
  submitMode,
  showControls = false,
  autoResize,
  maxLength,
  required,
  disabled,
  readOnly,
  name,
  className,
}: EditableProps) {
  const isInvalid = !!error;
  const errorMessage = typeof error === "string" ? error : undefined;

  return (
    <ArkEditable.Root
      className={clsx(editableStyles({ size }), className)}
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange && ((details) => onValueChange(details.value))}
      onValueCommit={onValueCommit && ((details) => onValueCommit(details.value))}
      placeholder={placeholder}
      activationMode={activationMode}
      submitMode={submitMode}
      autoResize={autoResize}
      maxLength={maxLength}
      invalid={isInvalid}
      required={required}
      disabled={disabled}
      readOnly={readOnly}
      name={name}
    >
      {label && (
        <ArkEditable.Label className="field__label">
          {label}
          {required && <span className="field__required" aria-hidden="true" />}
        </ArkEditable.Label>
      )}
      <ArkEditable.Area className="editable__area">
        <ArkEditable.Preview className="editable__preview" />
        <ArkEditable.Input className="editable__input" />
      </ArkEditable.Area>
      {/* Ark keeps the edit trigger and the submit/cancel pair mounted in
          opposite states, so the row swaps without any local state here. */}
      {showControls && (
        <ArkEditable.Control className="editable__control">
          <ArkEditable.EditTrigger asChild>
            <Button intent="ghost" size={size} type="button">
              Edit
            </Button>
          </ArkEditable.EditTrigger>
          <ArkEditable.SubmitTrigger asChild>
            <Button intent="secondary" size={size} type="button">
              Save
            </Button>
          </ArkEditable.SubmitTrigger>
          <ArkEditable.CancelTrigger asChild>
            <Button intent="ghost" size={size} type="button">
              Cancel
            </Button>
          </ArkEditable.CancelTrigger>
        </ArkEditable.Control>
      )}
      {helperText && !isInvalid && <span className="field__description">{helperText}</span>}
      {isInvalid && errorMessage && <FieldError>{errorMessage}</FieldError>}
    </ArkEditable.Root>
  );
}
