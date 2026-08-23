<script lang="ts">
  import { AngleSlider as ArkAngleSlider } from "@ark-ui/svelte";
  import { clsx } from "clsx";
  import { angleSliderStyles } from "@ui-organized/core";
  import FieldError from "../FieldError/FieldError.svelte";
  import type { AngleSliderProps } from "./AngleSlider.types.js";
  import "@ui-organized/core/components/AngleSlider/AngleSlider.css";

  let {
    label,
    helperText,
    error,
    value = $bindable(),
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
    class: className,
  }: AngleSliderProps = $props();

  const isInvalid = $derived(!!error);
  const errorMessage = $derived(typeof error === "string" ? error : undefined);
</script>

<ArkAngleSlider.Root
  class={clsx(angleSliderStyles({ size }), className)}
  {value}
  {defaultValue}
  onValueChange={(details) => {
    value = details.value;
    onValueChange?.(details.value);
  }}
  onValueChangeEnd={onValueChangeEnd && ((details) => onValueChangeEnd(details.value))}
  {step}
  invalid={isInvalid}
  {disabled}
  {readOnly}
  {name}
>
  {#if label || showValue}
    <div class="angle-slider__header">
      {#if label}
        <ArkAngleSlider.Label class="field__label">{label}</ArkAngleSlider.Label>
      {/if}
      <!--
        Ark's default text is the CSS angle (`135deg`). Supplying children
        overrides it, so the readout is typeset as a degree rather than spelled
        like a stylesheet value.

        ── Why the projected props are dropped ─────────────────────────────────

        Two things differ here, and the same asChild snippet settles both.

        The element: `@ark-ui/svelte` renders a <span>, `@ark-ui/react` a <div>,
        and inline vs block moves the readout inside a header both libraries lay
        out with one shared stylesheet.

        The attributes: `@ark-ui/react@5.37` never calls `getValueTextProps()` —
        it renders the caller's props and the degree text and nothing else — so
        its readout carries no `id`, `data-scope` or `data-part` at all. This is
        the wrapper, not the machine: both zag versions expose the getter. Ark
        Svelte does call it, so spreading here would give this library three
        attributes React's has none of, and an extra `id` shifts every later
        element's placeholder in the parity gate.

        So the div is written out in full rather than projected. When Ark React
        starts calling the getter, spread `props({ class: … })` instead — the
        gate goes red at that point, which is how you will find out.
      -->
      {#if showValue}
        <ArkAngleSlider.ValueText>
          {#snippet asChild()}
            <div class="angle-slider__value">
              <ArkAngleSlider.Context>
                {#snippet render(api)}{`${api().value}°`}{/snippet}
              </ArkAngleSlider.Context>
            </div>
          {/snippet}
        </ArkAngleSlider.ValueText>
      {/if}
    </div>
  {/if}
  <ArkAngleSlider.Control class="angle-slider__control">
    {#if markers && markers.length > 0}
      <ArkAngleSlider.MarkerGroup class="angle-slider__markers">
        {#each markers as marker (marker)}
          <!--
            Pinned to a <div>: `@ark-ui/svelte` renders a <span> here while
            `@ark-ui/react` renders a <div>, and a tick that is inline in one
            library and block in the other cannot be positioned by one shared
            rule. The class goes *through* Ark's props function rather than
            being spread after it, so Ark's own attributes — including the
            inline rotation the marker is placed by — survive the merge.
          -->
          <ArkAngleSlider.Marker value={marker}>
            {#snippet asChild(props)}
              <div {...props({ class: "angle-slider__marker" })}></div>
            {/snippet}
          </ArkAngleSlider.Marker>
        {/each}
      </ArkAngleSlider.MarkerGroup>
    {/if}
    <ArkAngleSlider.Thumb class="angle-slider__thumb" />
  </ArkAngleSlider.Control>
  {#if helperText && !isInvalid}
    <span class="field__description">{helperText}</span>
  {/if}
  {#if isInvalid && errorMessage}
    <FieldError message={errorMessage} />
  {/if}
  <ArkAngleSlider.HiddenInput />
</ArkAngleSlider.Root>
