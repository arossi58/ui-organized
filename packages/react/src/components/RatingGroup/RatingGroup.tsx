import { RatingGroup as ArkRatingGroup } from "@ark-ui/react";
import { clsx } from "clsx";
import { Icon } from "../Icon/Icon.js";
import { FieldError } from "../FieldError/index.js";
import { CONTROL_ICON_SIZE, ratingGroupStyles, type ControlSize } from "@ui-organized/core";
import type { RatingGroupProps } from "./RatingGroup.types.js";
import "@ui-organized/core/components/RatingGroup/RatingGroup.css";

const DEFAULT_COUNT = 5;

export function RatingGroup({
  label,
  helperText,
  error,
  count = DEFAULT_COUNT,
  value,
  defaultValue,
  onValueChange,
  allowHalf,
  size = "md",
  variant,
  readOnly,
  disabled,
  required,
  name,
  className,
}: RatingGroupProps) {
  const isInvalid = !!error;
  const errorMessage = typeof error === "string" ? error : undefined;
  const iconSize = CONTROL_ICON_SIZE[size as ControlSize];

  return (
    <ArkRatingGroup.Root
      className={clsx(ratingGroupStyles({ size, variant }), className)}
      count={count}
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange && ((details) => onValueChange(details.value))}
      allowHalf={allowHalf}
      readOnly={readOnly}
      disabled={disabled}
      required={required}
      name={name}
    >
      {label && (
        <ArkRatingGroup.Label className="field__label">
          {label}
          {required && <span className="field__required" aria-hidden="true" />}
        </ArkRatingGroup.Label>
      )}
      <ArkRatingGroup.Control className="rating-group__control">
        {/* `api.items` is the machine's index list — the source of truth for how
            many stars exist, so `count` never has to be walked twice. */}
        <ArkRatingGroup.Context>
          {(api) =>
            api.items.map((index) => (
              <ArkRatingGroup.Item key={index} index={index} className="rating-group__item">
                <Icon name="star" size={iconSize} className="rating-group__star" />
                {/* The half state is a clipped copy laid over the empty star.
                    Ark sets data-half on the item; the width is what does the
                    clipping, so the two stars stay pixel-aligned. */}
                {allowHalf && (
                  <span className="rating-group__half" aria-hidden="true">
                    <Icon name="star" size={iconSize} className="rating-group__star" />
                  </span>
                )}
              </ArkRatingGroup.Item>
            ))
          }
        </ArkRatingGroup.Context>
      </ArkRatingGroup.Control>
      {helperText && !isInvalid && (
        <span className="field__description">{helperText}</span>
      )}
      {isInvalid && errorMessage && <FieldError>{errorMessage}</FieldError>}
      <ArkRatingGroup.HiddenInput />
    </ArkRatingGroup.Root>
  );
}
