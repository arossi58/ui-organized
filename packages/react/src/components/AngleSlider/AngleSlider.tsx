import { AngleSlider as ArkAngleSlider } from "@ark-ui/react";
import { clsx } from "clsx";
import { FieldError } from "../FieldError/index.js";
import { angleSliderStyles } from "./AngleSlider.styles.js";
import type { AngleSliderProps } from "./AngleSlider.types.js";
import "@ui-organized/core/components/AngleSlider/AngleSlider.css";

export function AngleSlider({
  label,
  helperText,
  error,
  value,
  defaultValue,
  onValueChange,
  onValueChangeEnd,
  step,
  markers,
  showValue = false,
  size,
  disabled,
  readOnly,
  name,
  className,
}: AngleSliderProps) {
  const isInvalid = !!error;
  const errorMessage = typeof error === "string" ? error : undefined;

  return (
    <ArkAngleSlider.Root
      className={clsx(angleSliderStyles({ size }), className)}
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange && ((details) => onValueChange(details.value))}
      onValueChangeEnd={onValueChangeEnd && ((details) => onValueChangeEnd(details.value))}
      step={step}
      invalid={isInvalid}
      disabled={disabled}
      readOnly={readOnly}
      name={name}
    >
      {(label || showValue) && (
        <div className="angle-slider__header">
          {label && <ArkAngleSlider.Label className="field__label">{label}</ArkAngleSlider.Label>}
          {/* Ark's default text is the CSS angle (`135deg`). Supplying children
              overrides it, so the readout is typeset as a degree rather than
              spelled like a stylesheet value. */}
          {showValue && (
            <ArkAngleSlider.ValueText className="angle-slider__value">
              <ArkAngleSlider.Context>{(api) => `${api.value}°`}</ArkAngleSlider.Context>
            </ArkAngleSlider.ValueText>
          )}
        </div>
      )}
      <ArkAngleSlider.Control className="angle-slider__control">
        {markers && markers.length > 0 && (
          <ArkAngleSlider.MarkerGroup className="angle-slider__markers">
            {markers.map((marker) => (
              <ArkAngleSlider.Marker
                key={marker}
                value={marker}
                className="angle-slider__marker"
              />
            ))}
          </ArkAngleSlider.MarkerGroup>
        )}
        <ArkAngleSlider.Thumb className="angle-slider__thumb" />
      </ArkAngleSlider.Control>
      {helperText && !isInvalid && (
        <span className="field__description">{helperText}</span>
      )}
      {isInvalid && errorMessage && <FieldError>{errorMessage}</FieldError>}
      <ArkAngleSlider.HiddenInput />
    </ArkAngleSlider.Root>
  );
}
