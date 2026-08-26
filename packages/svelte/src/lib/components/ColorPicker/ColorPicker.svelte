<!--
  A swatch trigger and a portalled picker surface.

  Label / helper / error chrome comes from the shared `.field` layout, so the
  control lines up with every other form field; the trigger and the popup are
  colour-specific.
-->
<script lang="ts">
  import { ColorPicker as ArkColorPicker, Portal, parseColor } from "@ark-ui/svelte";
  import { clsx } from "clsx";
  import { CONTROL_ICON_SIZE, colorPickerStyles } from "@ui-organized/core";
  import Icon from "../Icon/Icon.svelte";
  import FieldError from "../FieldError/FieldError.svelte";
  import type { ColorPickerProps } from "./ColorPicker.types.js";
  import "@ui-organized/core/components/ColorPicker/ColorPicker.css";

  const DEFAULT_COLOR = "#000000";

  /**
   * Checkerboard cell size for the alpha grid.
   *
   * Passed explicitly rather than left to Ark's default so the number is visible
   * in the markup rather than hidden in the library. It stays a raw value: a
   * checker cell is a perceptual constant for reading transparency, not a brand
   * value that should shift with the spacing scale.
   */
  const TRANSPARENCY_CELL = "12px";

  let {
    label,
    helperText,
    error,
    value = $bindable(),
    defaultValue = DEFAULT_COLOR,
    onValueChange,
    onValueChangeEnd,
    format,
    swatches,
    showEyeDropper = true,
    open = $bindable(),
    defaultOpen,
    onOpenChange,
    size = "md",
    variant,
    required,
    disabled,
    readOnly,
    name,
    container,
    class: className,
  }: ColorPickerProps = $props();

  const isInvalid = $derived(!!error);
  const errorMessage = $derived(typeof error === "string" ? error : undefined);
  const iconSize = $derived(CONTROL_ICON_SIZE[size]);

  /* The machine's value is a parsed `Color`, not a string — passing a string
     throws. Coerced in here and back out via `valueAsString`, the same boundary
     conversion `Select` does for `string ↔ string[]`. */
  const colorValue = $derived(value != null ? parseColor(value) : undefined);
  const colorDefault = $derived(parseColor(defaultValue));
</script>

<ArkColorPicker.Root
  class={clsx(colorPickerStyles({ size, variant }), className)}
  value={colorValue}
  defaultValue={colorDefault}
  onValueChange={(details) => {
    value = details.valueAsString;
    onValueChange?.(details.valueAsString);
  }}
  onValueChangeEnd={(details) => onValueChangeEnd?.(details.valueAsString)}
  {format}
  {open}
  {defaultOpen}
  onOpenChange={(details) => {
    open = details.open;
    onOpenChange?.(details.open);
  }}
  invalid={isInvalid}
  {required}
  {disabled}
  {readOnly}
  {name}
  positioning={{ placement: "bottom-start", gutter: 4 }}
>
  {#if label}
    <ArkColorPicker.Label class="field__label">
      {label}
      {#if required}<span class="field__required" aria-hidden="true"></span>{/if}
    </ArkColorPicker.Label>
  {/if}

  <ArkColorPicker.Control class="color-picker__control">
    <ArkColorPicker.Trigger class="color-picker__trigger">
      <span class="color-picker__swatch-well">
        <ArkColorPicker.TransparencyGrid size={TRANSPARENCY_CELL} class="color-picker__grid" />
        <ArkColorPicker.ValueSwatch class="color-picker__value-swatch" />
      </span>
      {#if variant !== "swatch-only"}
        <ArkColorPicker.ValueText class="color-picker__value-text" />
      {/if}
    </ArkColorPicker.Trigger>
  </ArkColorPicker.Control>

  <Portal container={container ?? undefined}>
    <!--
      The positioner class must stay a plain string literal — the
      overlay-stacking test scans for it, and a clsx() call here silently
      unregisters the layer. Conditional classes go on the popup.
    -->
    <ArkColorPicker.Positioner class="color-picker__positioner">
      <ArkColorPicker.Content class="color-picker__popup">
        <ArkColorPicker.Area class="color-picker__area">
          <ArkColorPicker.AreaBackground class="color-picker__area-bg" />
          <ArkColorPicker.AreaThumb class="color-picker__thumb" />
        </ArkColorPicker.Area>

        <div class="color-picker__sliders">
          <div class="color-picker__slider-row">
            <ArkColorPicker.ChannelSlider channel="hue" class="color-picker__channel-slider">
              <ArkColorPicker.ChannelSliderTrack class="color-picker__channel-track" />
              <ArkColorPicker.ChannelSliderThumb class="color-picker__thumb" />
            </ArkColorPicker.ChannelSlider>
            {#if showEyeDropper}
              <ArkColorPicker.EyeDropperTrigger class="color-picker__eyedropper">
                <Icon name="pipette" size={iconSize} />
              </ArkColorPicker.EyeDropperTrigger>
            {/if}
          </div>

          <ArkColorPicker.ChannelSlider channel="alpha" class="color-picker__channel-slider">
            <ArkColorPicker.TransparencyGrid size={TRANSPARENCY_CELL} class="color-picker__grid" />
            <ArkColorPicker.ChannelSliderTrack class="color-picker__channel-track" />
            <ArkColorPicker.ChannelSliderThumb class="color-picker__thumb" />
          </ArkColorPicker.ChannelSlider>
        </div>

        {#if swatches && swatches.length > 0}
          <ArkColorPicker.SwatchGroup class="color-picker__swatches">
            {#each swatches as swatch (swatch)}
              <ArkColorPicker.SwatchTrigger value={swatch} class="color-picker__swatch-trigger">
                <ArkColorPicker.Swatch value={swatch} class="color-picker__swatch" />
              </ArkColorPicker.SwatchTrigger>
            {/each}
          </ArkColorPicker.SwatchGroup>
        {/if}
      </ArkColorPicker.Content>
    </ArkColorPicker.Positioner>
  </Portal>

  {#if helperText && !isInvalid}
    <span class="field__description">{helperText}</span>
  {/if}
  {#if isInvalid && errorMessage}
    <FieldError message={errorMessage} />
  {/if}
  <ArkColorPicker.HiddenInput />
</ArkColorPicker.Root>
