<script lang="ts">
  import { Checkbox as ArkCheckbox } from "@ark-ui/svelte";
  import { clsx } from "clsx";
  import { checkboxCardGroupStyles } from "@ui-organized/core";
  import Icon from "../Icon/Icon.svelte";
  import { glyph } from "../../icons/glyph.js";
  import type { CheckboxCardGroupProps } from "./CheckboxCardGroup.types.js";
  import "@ui-organized/core/components/Checkbox/Checkbox.css";
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
  }: CheckboxCardGroupProps = $props();

  // React uses useId() here; this is Svelte's equivalent.
  const uid = $props.id();
  const labelId = `${uid}-label`;
  const errorId = `${uid}-error`;
  const descriptionId = (v: string) => `${uid}-description-${v}`;
  const errorMessage = $derived(typeof error === "string" ? error : undefined);
</script>

<div class={clsx(checkboxCardGroupStyles({ size, columns, invalid: !!error }), className)}>
  {#if label}
    <div class="selection-card-group__label" id={labelId}>{label}</div>
  {/if}
  <ArkCheckbox.Group
    {value}
    {defaultValue}
    onValueChange={(next: string[]) => {
      value = next;
      onValueChange?.(next);
    }}
    {disabled}
    {name}
    invalid={!!error}
    aria-labelledby={label ? labelId : undefined}
    aria-label={label ? undefined : ariaLabel}
    aria-describedby={errorMessage ? errorId : undefined}
    class="selection-card-group__items"
  >
    {#each options as opt (opt.value)}
      <!-- Each Root is the <label>, so the whole card is the hit target. -->
      <ArkCheckbox.Root
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
          <ArkCheckbox.Label class="selection-card__title">{opt.label}</ArkCheckbox.Label>
          {#if opt.description}
            <span class="selection-card__description" id={descriptionId(opt.value)}>{opt.description}</span>
          {/if}
        </span>
        <ArkCheckbox.Control class="checkbox__control selection-card__control">
          <ArkCheckbox.Indicator class="checkbox__indicator">
            <Icon name={glyph("check")} size={16} class="checkbox__check" />
          </ArkCheckbox.Indicator>
        </ArkCheckbox.Control>
        <!-- Named by the title alone; the description is read after it. -->
        <ArkCheckbox.HiddenInput aria-describedby={opt.description ? descriptionId(opt.value) : undefined} />
      </ArkCheckbox.Root>
    {/each}
  </ArkCheckbox.Group>
  {#if errorMessage}
    <div class="selection-card-group__error" id={errorId}>
      <Icon name={glyph("alert-circle")} size={16} />
      <span>{errorMessage}</span>
    </div>
  {/if}
</div>
