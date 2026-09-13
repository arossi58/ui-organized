<script lang="ts">
  import { Checkbox as ArkCheckbox } from "@ark-ui/svelte";
  import { clsx } from "clsx";
  import { OMIT_ARIA } from "@ui-organized/core";
  import Icon from "../Icon/Icon.svelte";
  import type { CheckboxProps } from "./Checkbox.types.js";
  import "@ui-organized/core/components/Checkbox/Checkbox.css";

  let {
    checked = $bindable(),
    defaultChecked,
    indeterminate,
    onCheckedChange,
    label,
    disabled,
    required,
    name,
    id,
    class: className,
    "aria-label": ariaLabel,
  }: CheckboxProps = $props();

  // Ark folds indeterminate into the checked value rather than taking it as a
  // separate prop, so the facade's boolean is translated at the boundary — and
  // back again in the callback, where only a true `true` counts as checked.
  const arkChecked = $derived(indeterminate ? "indeterminate" : checked);
</script>

<!-- Ark's Checkbox.Root *is* the <label>. -->
<ArkCheckbox.Root
  class={clsx("checkbox", disabled && "checkbox--disabled", className)}
  checked={arkChecked}
  {defaultChecked}
  onCheckedChange={(details) => {
    checked = details.checked === true;
    onCheckedChange?.(details.checked === true);
  }}
  {disabled}
  {required}
  {name}
  {id}
>
  <ArkCheckbox.Control class="checkbox__control">
    <ArkCheckbox.Indicator class="checkbox__indicator">
      {#if indeterminate}
        <span class="checkbox__indicator--indeterminate"></span>
      {:else}
        <Icon name="check" size={16} class="checkbox__check" />
      {/if}
    </ArkCheckbox.Indicator>
  </ArkCheckbox.Control>
  {#if label}
    <ArkCheckbox.Label class="checkbox__label text-default-body-large">{label}</ArkCheckbox.Label>
  {/if}
  <!--
    Ark points the input at the Label part unconditionally. With no `label` there
    is no such element, so the reference dangles — and a dangling
    `aria-labelledby` outranks `aria-label`, leaving the box nameless.
  -->
  <ArkCheckbox.HiddenInput
    aria-labelledby={label ? undefined : OMIT_ARIA}
    aria-label={label ? undefined : ariaLabel}
  />
</ArkCheckbox.Root>
