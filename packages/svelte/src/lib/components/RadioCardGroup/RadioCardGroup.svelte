<script lang="ts">
  import { RadioGroup as ArkRadioGroup } from "@ark-ui/svelte";
  import { clsx } from "clsx";
  import { OMIT_ARIA, radioCardGroupStyles } from "@ui-organized/core";
  import Icon from "../Icon/Icon.svelte";
  import { glyph } from "../../icons/glyph.js";
  import type { RadioCardGroupProps } from "./RadioCardGroup.types.js";
  import "@ui-organized/core/components/Radio/Radio.css";
  import "@ui-organized/core/components/SelectionCard/SelectionCard.css";

  let {
    options,
    value = $bindable(),
    defaultValue,
    onValueChange,
    label,
    columns,
    size,
    indicator = "end",
    disabled,
    name,
    error,
    class: className,
    "aria-label": ariaLabel,
  }: RadioCardGroupProps = $props();

  // React uses useId() here; this is Svelte's equivalent. The group label sits
  // outside Ark's Root, so Ark is handed the id of the heading this renders.
  const uid = $props.id();
  const labelId = `${uid}-label`;
  const errorId = `${uid}-error`;
  const descriptionId = (v: string) => `${uid}-description-${v}`;
  const errorMessage = $derived(typeof error === "string" ? error : undefined);
</script>

<div class={clsx(radioCardGroupStyles({ size, columns, invalid: !!error }), className)}>
  {#if label}
    <div class="selection-card-group__label" id={labelId}>{label}</div>
  {/if}
  <ArkRadioGroup.Root
    ids={label ? { label: labelId } : undefined}
    aria-labelledby={label ? undefined : OMIT_ARIA}
    aria-label={label ? undefined : ariaLabel}
    aria-describedby={errorMessage ? errorId : undefined}
    {value}
    {defaultValue}
    onValueChange={(details) => {
      if (details.value != null) {
        value = details.value;
        onValueChange?.(details.value);
      }
    }}
    {disabled}
    {name}
    class="selection-card-group__items"
  >
    {#each options as opt (opt.value)}
      <!-- The Item is the <label>, so the whole card is the hit target. -->
      <ArkRadioGroup.Item
        value={opt.value}
        disabled={opt.disabled}
        class={clsx("selection-card", `selection-card--indicator-${indicator}`)}
      >
        {#if opt.icon != null}
          <span class="selection-card__icon" aria-hidden="true">
            <Icon name={opt.icon} size={20} />
          </span>
        {/if}
        <span class="selection-card__body">
          <ArkRadioGroup.ItemText class="selection-card__title">{opt.label}</ArkRadioGroup.ItemText>
          {#if opt.description}
            <span class="selection-card__description" id={descriptionId(opt.value)}>{opt.description}</span>
          {/if}
        </span>
        <ArkRadioGroup.ItemControl class="radio-item__control selection-card__control">
          <span class="radio-item__indicator"></span>
        </ArkRadioGroup.ItemControl>
        <!-- Named by the title alone; the description is read after it. -->
        <ArkRadioGroup.ItemHiddenInput
          aria-describedby={opt.description ? descriptionId(opt.value) : undefined}
        />
      </ArkRadioGroup.Item>
    {/each}
  </ArkRadioGroup.Root>
  {#if errorMessage}
    <div class="selection-card-group__error" id={errorId}>
      <Icon name={glyph("alert-circle")} size={16} />
      <span>{errorMessage}</span>
    </div>
  {/if}
</div>
