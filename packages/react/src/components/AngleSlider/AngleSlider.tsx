import { AngleSlider as ArkAngleSlider } from "@ark-ui/react";
import { clsx } from "clsx";
import { FieldError } from "../FieldError/index.js";
import { angleSliderStyles } from "./AngleSlider.styles.js";
import type { AngleSliderProps } from "./AngleSlider.types.js";
import "./AngleSlider.css";

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
  showValue = true,
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
      <ArkAngleSlider.Control className="angle-slider__control">
        {markers && markers.length > 0 && (
          <ArkAngleSlider.MarkerGroup className="angle-slider__markers">
            {markers.map((marker) => (
              <ArkAngleSlider.Marker key={marker} value={marker} className="angle-slider__marker" />
            ))}
          </ArkAngleSlider.MarkerGroup>
        )}
        {/* The readout sits in the hollow of the ring. It stays inside Control
            so it is centred on the dial rather than on the field column, and
            CSS makes it click-through so the dial still tracks a press on it. */}
        {(showValue || label) && (
          <div className="angle-slider__readout">
            {/* Ark's default text is the CSS angle (`135deg`). Supplying children
                overrides it, so the readout is typeset as a degree rather than
                spelled like a stylesheet value. */}
            {showValue && (
              <ArkAngleSlider.ValueText className="angle-slider__value">
                <ArkAngleSlider.Context>{(api) => `${api.value}°`}</ArkAngleSlider.Context>
              </ArkAngleSlider.ValueText>
            )}
            {label && (
              <ArkAngleSlider.Label className="angle-slider__label">{label}</ArkAngleSlider.Label>
            )}
          </div>
        )}
        <ArkAngleSlider.Thumb className="angle-slider__thumb" />
      </ArkAngleSlider.Control>
      {helperText && !isInvalid && <span className="field__description">{helperText}</span>}
      {isInvalid && errorMessage && <FieldError>{errorMessage}</FieldError>}
      <ArkAngleSlider.HiddenInput />
    </ArkAngleSlider.Root>
  );
}
