<script lang="ts">
  import { RatingGroup as ArkRatingGroup } from "@ark-ui/svelte";
  import { clsx } from "clsx";
  import { CONTROL_ICON_SIZE, ratingGroupStyles, type ControlSize } from "@ui-organized/core";
  import Icon from "../Icon/Icon.svelte";
  import FieldError from "../FieldError/FieldError.svelte";
  import type { RatingGroupProps } from "./RatingGroup.types.js";
  import "@ui-organized/core/components/RatingGroup/RatingGroup.css";

  const DEFAULT_COUNT = 5;

  let {
    label,
    helperText,
    error,
    count = DEFAULT_COUNT,
    value = $bindable(),
    defaultValue,
    onValueChange,
    allowHalf,
    size = "md",
    variant,
    readOnly,
    disabled,
    required,
    name,
    class: className,
  }: RatingGroupProps = $props();

  const isInvalid = $derived(!!error);
  const errorMessage = $derived(typeof error === "string" ? error : undefined);
  const iconSize = $derived(CONTROL_ICON_SIZE[size as ControlSize]);
</script>

<ArkRatingGroup.Root
  class={clsx(ratingGroupStyles({ size, variant }), className)}
  {count}
  {value}
  {defaultValue}
  onValueChange={(details) => {
    value = details.value;
    onValueChange?.(details.value);
  }}
  {allowHalf}
  {readOnly}
  {disabled}
  {required}
  {name}
>
  {#if label}
    <ArkRatingGroup.Label class="field__label">
      {label}
      {#if required}<span class="field__required" aria-hidden="true"></span>{/if}
    </ArkRatingGroup.Label>
  {/if}
  <ArkRatingGroup.Control class="rating-group__control">
    <!--
      `api.items` is the machine's index list — the source of truth for how many
      stars exist, so `count` never has to be walked twice. The Svelte context
      part hands the api over as an accessor, hence `api()`.
    -->
    <ArkRatingGroup.Context>
      {#snippet render(api)}
        {#each api().items as index (index)}
          <ArkRatingGroup.Item {index} class="rating-group__item">
            <Icon name="star" size={iconSize} class="rating-group__star" />
            <!--
              The half state is a clipped copy laid over the empty star. Ark sets
              data-half on the item; the width is what does the clipping, so the
              two stars stay pixel-aligned.
            -->
            {#if allowHalf}
              <span class="rating-group__half" aria-hidden="true">
                <Icon name="star" size={iconSize} class="rating-group__star" />
              </span>
            {/if}
          </ArkRatingGroup.Item>
        {/each}
      {/snippet}
    </ArkRatingGroup.Context>
  </ArkRatingGroup.Control>
  {#if helperText && !isInvalid}
    <span class="field__description">{helperText}</span>
  {/if}
  {#if isInvalid && errorMessage}
    <FieldError message={errorMessage} />
  {/if}
  <ArkRatingGroup.HiddenInput />
</ArkRatingGroup.Root>
