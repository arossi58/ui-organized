<script lang="ts">
  import { RadioGroup as ArkRadioGroup } from "@ark-ui/svelte";
  import { clsx } from "clsx";
  import { radioGroupStyles, OMIT_ARIA } from "@ui-organized/core";
  import Icon from "../Icon/Icon.svelte";
  import type { RadioGroupProps } from "./Radio.types.js";
  import "@ui-organized/core/components/Radio/Radio.css";

  let {
    options,
    value = $bindable(),
    defaultValue,
    onValueChange,
    label,
    orientation = "vertical",
    disabled,
    name,
    class: className,
    "aria-label": ariaLabel,
  }: RadioGroupProps = $props();

  // The group label sits outside Ark's Root — it's a sibling of the items, not a
  // child — so the Label part is never rendered and the radiogroup's
  // `aria-labelledby` would dangle. Handing Ark the id of the heading we do
  // render points it at a real element instead. React uses useId() here; this is
  // Svelte's equivalent.
  const labelId = $props.id();
</script>

<div class={clsx(radioGroupStyles({ orientation }), className)}>
  {#if label}
    <div class="radio-group__label" id={labelId}>{label}</div>
  {/if}
  <ArkRadioGroup.Root
    ids={label ? { label: labelId } : undefined}
    aria-labelledby={label ? undefined : OMIT_ARIA}
    aria-label={label ? undefined : ariaLabel}
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
    {orientation}
    class="radio-group__items"
  >
    {#each options as opt (opt.value)}
      <div class="radio-item-wrap">
        <!--
          Ark's RadioGroup.Item *is* the <label>; the dot is a plain child of
          ItemControl, shown via [data-state="checked"] in CSS.
        -->
        <ArkRadioGroup.Item
          value={opt.value}
          disabled={opt.disabled}
          class={clsx(
            "radio-item",
            opt.disabled && "radio-item--disabled",
            opt.error && "radio-item--error",
          )}
        >
          <ArkRadioGroup.ItemControl class="radio-item__control">
            <span class="radio-item__indicator"></span>
          </ArkRadioGroup.ItemControl>
          <ArkRadioGroup.ItemText class="radio-item__label text-default-body-large">
            {opt.label}
          </ArkRadioGroup.ItemText>
          <ArkRadioGroup.ItemHiddenInput />
        </ArkRadioGroup.Item>
        {#if opt.error}
          <div class="radio-item__error-message">
            <Icon name="alert-circle" size={16} />
            <span class="radio-item__error-text text-emphasis-body-small">{opt.error}</span>
          </div>
        {/if}
      </div>
    {/each}
  </ArkRadioGroup.Root>
</div>
