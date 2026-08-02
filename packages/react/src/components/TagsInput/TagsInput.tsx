import { TagsInput as ArkTagsInput } from "@ark-ui/react";
import { clsx } from "clsx";
import { Icon } from "../Icon/Icon.js";
import { FieldError } from "../FieldError/index.js";
import { tagsInputStyles } from "./TagsInput.styles.js";
import type { TagsInputProps } from "./TagsInput.types.js";
import "./TagsInput.css";

/** Delete affordance inside a tag — always the small edge, at every control
 *  size, because it sits inside the chip rather than beside it. */
const DELETE_ICON_SIZE = 12;

export function TagsInput({
  label,
  helperText,
  error,
  value,
  defaultValue,
  onValueChange,
  placeholder,
  size,
  max,
  editable,
  delimiter,
  addOnPaste,
  required,
  disabled,
  readOnly,
  name,
  className,
}: TagsInputProps) {
  const isInvalid = !!error;
  const errorMessage = typeof error === "string" ? error : undefined;

  return (
    <ArkTagsInput.Root
      className={clsx(tagsInputStyles({ size }), className)}
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange && ((details) => onValueChange(details.value))}
      max={max}
      editable={editable}
      delimiter={delimiter}
      addOnPaste={addOnPaste}
      invalid={isInvalid}
      required={required}
      disabled={disabled}
      readOnly={readOnly}
      name={name}
    >
      {label && (
        <ArkTagsInput.Label className="field__label">
          {label}
          {required && <span className="field__required" aria-hidden="true" />}
        </ArkTagsInput.Label>
      )}
      <ArkTagsInput.Control className="tags-input__control">
        {/* The tags are machine state, not children, so the list is read back
            from the context rather than mapped over the `value` prop — that
            keeps in-place editing (ItemInput) working on the machine's copy. */}
        <ArkTagsInput.Context>
          {(api) =>
            api.value.map((tag, index) => (
              <ArkTagsInput.Item key={`${tag}-${index}`} index={index} value={tag}>
                <ArkTagsInput.ItemPreview className="tags-input__tag">
                  <ArkTagsInput.ItemText className="tags-input__tag-label">
                    {tag}
                  </ArkTagsInput.ItemText>
                  <ArkTagsInput.ItemDeleteTrigger className="tags-input__tag-delete">
                    <Icon name="close" size={DELETE_ICON_SIZE} />
                  </ArkTagsInput.ItemDeleteTrigger>
                </ArkTagsInput.ItemPreview>
                <ArkTagsInput.ItemInput className="tags-input__tag-input" />
              </ArkTagsInput.Item>
            ))
          }
        </ArkTagsInput.Context>
        <ArkTagsInput.Input className="tags-input__entry" placeholder={placeholder} />
      </ArkTagsInput.Control>
      {helperText && !isInvalid && (
        <span className="field__description">{helperText}</span>
      )}
      {isInvalid && errorMessage && <FieldError>{errorMessage}</FieldError>}
      <ArkTagsInput.HiddenInput />
    </ArkTagsInput.Root>
  );
}
