import { useMemo } from "react";
import { ColorPicker as ArkColorPicker, Portal, parseColor } from "@ark-ui/react";
import { clsx } from "clsx";
import { Icon } from "../Icon/index.js";
import { FieldError } from "../FieldError/index.js";
import { CONTROL_ICON_SIZE, type ControlSize } from "../controlSize.js";
import { colorPickerStyles } from "./ColorPicker.styles.js";
import type { ColorPickerProps } from "./ColorPicker.types.js";
import "./ColorPicker.css";
import { useContainedPositioning, useOverlayPortal } from "../../preview/useOverlayPortal.js";

const DEFAULT_COLOR = "#000000";

/**
 * Checkerboard cell size for the alpha grid.
 *
 * Passed explicitly rather than left to Ark's default so the number is visible
 * in the TSX rather than hidden in the library. It stays a raw value: a checker
 * cell is a perceptual constant for reading transparency, not a brand value
 * that should shift with the spacing scale.
 */
const TRANSPARENCY_CELL = "12px";

export function ColorPicker({
  label,
  helperText,
  error,
  value,
  defaultValue = DEFAULT_COLOR,
  onValueChange,
  onValueChangeEnd,
  format,
  swatches,
  showEyeDropper = true,
  open,
  defaultOpen,
  onOpenChange,
  size = "md",
  variant,
  required,
  disabled,
  readOnly,
  name,
  container,
  className,
}: ColorPickerProps) {
  const isInvalid = !!error;
  const errorMessage = typeof error === "string" ? error : undefined;
  const iconSize = CONTROL_ICON_SIZE[size as ControlSize];
  const portal = useOverlayPortal(container);
  const containedPositioning = useContainedPositioning();

  /* The machine's value is a parsed `Color`, not a string — passing a string
     throws. Coerced in here and back out via `valueAsString`, the same boundary
     conversion `Select` does for `string ↔ string[]`. */
  const colorValue = useMemo(() => (value != null ? parseColor(value) : undefined), [value]);
  const colorDefault = useMemo(() => parseColor(defaultValue), [defaultValue]);

  return (
    <ArkColorPicker.Root
      className={clsx(colorPickerStyles({ size, variant }), className)}
      value={colorValue}
      defaultValue={colorDefault}
      onValueChange={(details) => onValueChange?.(details.valueAsString)}
      onValueChangeEnd={(details) => onValueChangeEnd?.(details.valueAsString)}
      format={format}
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={(details) => onOpenChange?.(details.open)}
      invalid={isInvalid}
      required={required}
      disabled={disabled}
      readOnly={readOnly}
      name={name}
      positioning={{ placement: "bottom-start", gutter: 4, ...containedPositioning }}
    >
      {label && (
        <ArkColorPicker.Label className="field__label">
          {label}
          {required && <span className="field__required" aria-hidden="true" />}
        </ArkColorPicker.Label>
      )}

      <ArkColorPicker.Control className="color-picker__control">
        <ArkColorPicker.Trigger className="color-picker__trigger">
          <span className="color-picker__swatch-well">
            <ArkColorPicker.TransparencyGrid
              size={TRANSPARENCY_CELL}
              className="color-picker__grid"
            />
            <ArkColorPicker.ValueSwatch className="color-picker__value-swatch" />
          </span>
          {variant !== "swatch-only" && (
            <ArkColorPicker.ValueText className="color-picker__value-text" />
          )}
        </ArkColorPicker.Trigger>
      </ArkColorPicker.Control>

      <Portal {...portal}>
        {/* The positioner className must stay a plain string literal — the
            overlay-stacking test scans for it, and a clsx() call here silently
            unregisters the layer. Conditional classes go on the popup. */}
        <ArkColorPicker.Positioner className="color-picker__positioner">
          <ArkColorPicker.Content className="color-picker__popup">
            <ArkColorPicker.Area className="color-picker__area">
              <ArkColorPicker.AreaBackground className="color-picker__area-bg" />
              <ArkColorPicker.AreaThumb className="color-picker__thumb" />
            </ArkColorPicker.Area>

            <div className="color-picker__sliders">
              <div className="color-picker__slider-row">
                <ArkColorPicker.ChannelSlider
                  channel="hue"
                  className="color-picker__channel-slider"
                >
                  <ArkColorPicker.ChannelSliderTrack className="color-picker__channel-track" />
                  <ArkColorPicker.ChannelSliderThumb className="color-picker__thumb" />
                </ArkColorPicker.ChannelSlider>
                {showEyeDropper && (
                  <ArkColorPicker.EyeDropperTrigger className="color-picker__eyedropper">
                    <Icon name="pipette" size={iconSize} />
                  </ArkColorPicker.EyeDropperTrigger>
                )}
              </div>

              <ArkColorPicker.ChannelSlider
                channel="alpha"
                className="color-picker__channel-slider"
              >
                <ArkColorPicker.TransparencyGrid
                  size={TRANSPARENCY_CELL}
                  className="color-picker__grid"
                />
                <ArkColorPicker.ChannelSliderTrack className="color-picker__channel-track" />
                <ArkColorPicker.ChannelSliderThumb className="color-picker__thumb" />
              </ArkColorPicker.ChannelSlider>
            </div>

            {swatches && swatches.length > 0 && (
              <ArkColorPicker.SwatchGroup className="color-picker__swatches">
                {swatches.map((swatch) => (
                  <ArkColorPicker.SwatchTrigger
                    key={swatch}
                    value={swatch}
                    className="color-picker__swatch-trigger"
                  >
                    <ArkColorPicker.Swatch value={swatch} className="color-picker__swatch" />
                  </ArkColorPicker.SwatchTrigger>
                ))}
              </ArkColorPicker.SwatchGroup>
            )}
          </ArkColorPicker.Content>
        </ArkColorPicker.Positioner>
      </Portal>

      {helperText && !isInvalid && (
        <span className="field__description">{helperText}</span>
      )}
      {isInvalid && errorMessage && <FieldError>{errorMessage}</FieldError>}
      <ArkColorPicker.HiddenInput />
    </ArkColorPicker.Root>
  );
}
