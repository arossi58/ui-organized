<script lang="ts">
  import { SignaturePad as ArkSignaturePad } from "@ark-ui/svelte";
  import { clsx } from "clsx";
  import { signaturePadStyles } from "@ui-organized/core";
  import Button from "../Button/Button.svelte";
  import FieldError from "../FieldError/FieldError.svelte";
  import type { SignaturePadProps } from "./SignaturePad.types.js";
  import "@ui-organized/core/components/SignaturePad/SignaturePad.css";

  const DEFAULT_STROKE_WIDTH = 2;

  let {
    label,
    helperText,
    error,
    paths = $bindable(),
    defaultPaths,
    onDraw,
    onDrawEnd,
    strokeWidth = DEFAULT_STROKE_WIDTH,
    showGuide = true,
    showClear = true,
    clearLabel = "Clear",
    size = "md",
    variant,
    required,
    disabled,
    readOnly,
    name,
    class: className,
  }: SignaturePadProps = $props();

  const isInvalid = $derived(!!error);
  const errorMessage = $derived(typeof error === "string" ? error : undefined);
</script>

<ArkSignaturePad.Root
  class={clsx(signaturePadStyles({ size, variant }), className)}
  {paths}
  {defaultPaths}
  onDraw={(details) => {
    paths = details.paths;
    onDraw?.(details.paths);
  }}
  onDrawEnd={onDrawEnd && ((details) => onDrawEnd(details.paths, details.getDataUrl))}
  drawing={{ size: strokeWidth }}
  {required}
  {disabled}
  {readOnly}
  {name}
>
  {#if label}
    <ArkSignaturePad.Label class="field__label">
      {label}
      {#if required}<span class="field__required" aria-hidden="true"></span>{/if}
    </ArkSignaturePad.Label>
  {/if}

  <ArkSignaturePad.Control class="signature-pad__control">
    <!--
      Ark's `Segment` renders the whole signature: it maps the machine's `paths`
      itself and appends the in-progress `currentPath`. So it is rendered ONCE.

      It used to be mapped over `api().paths`, which produced one `<svg>` per
      stroke, each drawing every stroke — N copies stacked exactly on top of one
      another — and the `path` prop Ark does not read was spread onto the `<svg>`
      as a stray attribute. It looked right, because the topmost copy is the
      correct one.
    -->
    <ArkSignaturePad.Segment class="signature-pad__segment" />
    {#if showGuide}<ArkSignaturePad.Guide class="signature-pad__guide" />{/if}
  </ArkSignaturePad.Control>

  <!--
    The clear control *is* the library Button, projected through Ark's asChild so
    it inherits every interactive token instead of restating them. `class` is
    pulled out and handed over separately because Ark types the projected props
    in Svelte's own shapes, where it is a `ClassValue` that may be null while the
    Button takes a string.
  -->
  {#if showClear}
    <ArkSignaturePad.ClearTrigger>
      {#snippet asChild(props)}
        {@const { class: arkClass, ...triggerProps } = props()}
        <Button
          intent="ghost"
          {size}
          type="button"
          icon="refresh"
          class={clsx(arkClass)}
          {...triggerProps}
        >
          {clearLabel}
        </Button>
      {/snippet}
    </ArkSignaturePad.ClearTrigger>
  {/if}

  {#if helperText && !isInvalid}
    <span class="field__description">{helperText}</span>
  {/if}
  {#if isInvalid && errorMessage}
    <FieldError message={errorMessage} />
  {/if}
  <!--
    The hidden input requires an explicit value, and the machine offers two
    forms: the stroke paths, and a rasterised data URL from `getDataUrl` — which
    is async and so cannot feed a render-time prop. The paths are submitted
    instead: they are lossless, resolution independent, and deterministic. Reach
    for the PNG via `onDrawEnd`, whose details carry `getDataUrl`, when a raster
    is what the server wants.
  -->
  <ArkSignaturePad.Context>
    {#snippet render(api)}
      <ArkSignaturePad.HiddenInput value={api().paths.join(" ")} />
    {/snippet}
  </ArkSignaturePad.Context>
</ArkSignaturePad.Root>
