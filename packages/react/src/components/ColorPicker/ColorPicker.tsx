import { useMemo, useState } from "react";
import { ColorPicker as ArkColorPicker, Portal, parseColor } from "@ark-ui/react";
import { clsx } from "clsx";
import { Icon } from "../Icon/index.js";
import { FieldError } from "../FieldError/index.js";
import {
  CONTROL_ICON_SIZE,
  CONTROL_TEXT_CLASS,
  colorPickerStyles,
  formatOklch,
  type ControlSize,
} from "@ui-organized/core";
import type { ColorPickerProps } from "./ColorPicker.types.js";
import "@ui-organized/core/components/ColorPicker/ColorPicker.css";
import { useContainedPositioning, useOverlayPortal } from "../../preview/useOverlayPortal.js";
import { FormatInputs, toRgba, type ColorLike, type InputFormat } from "./channelFields.js";

const DEFAULT_COLOR = "#000000";

/**
 * The machine models `rgba`/`hsla`/`hsba` and nothing else, so the two notations
 * it cannot hold — hex, which is a rendering of rgba, and OKLCH, which is a
 * different colour space entirely — run on rgba underneath and are converted for
 * display. Keeping the machine's format tied to the `format` prop rather than to
 * the picker's notation select is deliberate: the machine's format is also what
 * decides the hidden input's form value and whether the picker area is
 * saturation×brightness or saturation×lightness, and a display control has no
 * business moving either.
 */
const MACHINE_FORMAT = {
  rgba: "rgba",
  hex: "rgba",
  oklch: "rgba",
  hsla: "hsla",
  hsba: "hsba",
} as const;

/** Which notation the picker's inputs open on, given what the field emits. */
const INITIAL_INPUT_FORMAT = {
  rgba: "rgb",
  hex: "hex",
  oklch: "oklch",
  hsla: "hsl",
  hsba: "rgb",
} as const;

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
  format = "rgba",
  swatches,
  showEyeDropper = true,
  showFormatInputs = true,
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
     throws. Coerced in here and back out through `emit`, the same boundary
     conversion `Select` does for `string ↔ string[]`. */
  const colorValue = useMemo(() => (value != null ? parseColor(value) : undefined), [value]);
  const colorDefault = useMemo(() => parseColor(defaultValue), [defaultValue]);

  /* Which notation the picker's fields are showing. Local, because it is a way
     of reading the colour rather than a property of it — see `format`. */
  const [inputFormat, setInputFormat] = useState<InputFormat>(INITIAL_INPUT_FORMAT[format]);

  /* Every string this component hands back goes through here, so a reader
     switching the fields to OKLCH cannot change the shape of what the consumer
     receives. `toString` covers the notations the colour object knows; OKLCH is
     the one it does not. */
  const emit = (color: ColorLike) =>
    format === "oklch" ? formatOklch(toRgba(color)) : color.toString(format);

  /** True when the machine's own value string is already the notation we emit. */
  const emitsMachineFormat = MACHINE_FORMAT[format] === format;

  return (
    <ArkColorPicker.Root
      className={clsx(colorPickerStyles({ size, variant }), className)}
      value={colorValue}
      defaultValue={colorDefault}
      onValueChange={(details) => onValueChange?.(emit(details.value))}
      onValueChangeEnd={(details) => onValueChangeEnd?.(emit(details.value))}
      format={MACHINE_FORMAT[format]}
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={(details) => onOpenChange?.(details.open)}
      invalid={isInvalid}
      required={required}
      disabled={disabled}
      readOnly={readOnly}
      name={emitsMachineFormat ? name : undefined}
      positioning={{ placement: "bottom-start", gutter: 4, ...containedPositioning }}
    >
      {label && (
        <ArkColorPicker.Label className="field__label">
          {label}
          {required && <span className="field__required" aria-hidden="true" />}
        </ArkColorPicker.Label>
      )}

      <ArkColorPicker.Control className="color-picker__control">
        {/* The size ramp is the shared control one, so a picker lines up with a
            Button or a Select beside it: the typography class per size is the
            same map `Button` reads, and the height and padding tokens in the CSS
            are the ones `.btn--{size}` uses. */}
        <ArkColorPicker.Trigger
          className={clsx(CONTROL_TEXT_CLASS[size as ControlSize], "color-picker__trigger")}
        >
          <span className="color-picker__swatch-well">
            <ArkColorPicker.TransparencyGrid
              size={TRANSPARENCY_CELL}
              className="color-picker__grid"
            />
            <ArkColorPicker.ValueSwatch className="color-picker__value-swatch" />
          </span>
          {/* The trigger reads the value in the notation this component emits,
              not the one the picker's fields happen to be showing, so it always
              matches the string a consumer's `onValueChange` receives. Ark can
              render every notation but OKLCH, which needs its own text. */}
          {variant !== "swatch-only" &&
            (format === "oklch" ? (
              <ArkColorPicker.Context>
                {(api) => (
                  <ArkColorPicker.ValueText className="color-picker__value-text">
                    {formatOklch(toRgba(api.value))}
                  </ArkColorPicker.ValueText>
                )}
              </ArkColorPicker.Context>
            ) : (
              <ArkColorPicker.ValueText format={format} className="color-picker__value-text" />
            ))}
        </ArkColorPicker.Trigger>
      </ArkColorPicker.Control>

      <Portal {...portal}>
        {/* The positioner className must stay a plain string literal — the
            overlay-stacking test scans for it, and a clsx() call here silently
            unregisters the layer. Conditional classes go on the popup. */}
        <ArkColorPicker.Positioner className="color-picker__positioner">
          {/* Ark gives the content `role="dialog"`, which needs a name, and this
              popup has no title to take one from — the same trap `PopoverTitle`
              exists to close. Without this it reaches a screen reader as an
              unnamed dialog (axe `aria-dialog-name`). */}
          <ArkColorPicker.Content
            className="color-picker__popup"
            aria-label={label ? `${label} colour picker` : "Colour picker"}
          >
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

            {showFormatInputs && (
              <ArkColorPicker.Context>
                {(api) => (
                  <FormatInputs
                    format={inputFormat}
                    onFormatChange={setInputFormat}
                    color={api.value}
                    /* A typed edit is a finished interaction, so it reports an
                       end as well as a change — unlike a drag, which reports
                       many changes and one end when the pointer lifts. */
                    onCommit={(next) => {
                      api.setValue(next);
                      onValueChangeEnd?.(emit(next));
                    }}
                    disabled={disabled}
                    readOnly={readOnly}
                    container={container}
                  />
                )}
              </ArkColorPicker.Context>
            )}

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

      {helperText && !isInvalid && <span className="field__description">{helperText}</span>}
      {isInvalid && errorMessage && <FieldError>{errorMessage}</FieldError>}

      {/* Ark's hidden input carries the machine's own notation, which is the
          submitted value for the three formats the machine can hold. Hex and
          OKLCH it cannot, so for those the name is withheld from the machine
          (see `name` on the root) and given to an input that writes what this
          component says it emits — a form must never receive a notation the
          `format` prop did not name. Ark's input stays either way: the machine
          finds it by id to track form resets. */}
      {/* Named explicitly: the visible label is optional (a swatch-only picker
          has none), and without it this input — which exists only so the machine
          can track form resets — was a form field with no accessible name at
          all. It is `tabindex="-1"` and visually hidden, so the name is never
          announced in normal use; it is there so the field is not nameless. */}
      <ArkColorPicker.HiddenInput aria-label={label ?? "Color"} />
      {!emitsMachineFormat && name && (
        <ArkColorPicker.Context>
          {(api) => <input type="hidden" name={name} value={emit(api.value)} />}
        </ArkColorPicker.Context>
      )}
    </ArkColorPicker.Root>
  );
}
