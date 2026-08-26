<script lang="ts">
  import { Switch as ArkSwitch } from "@ark-ui/svelte";
  import { clsx } from "clsx";
  import { OMIT_ARIA } from "@ui-organized/core";
  import type { SwitchProps } from "./Switch.types.js";
  import "@ui-organized/core/components/Switch/Switch.css";

  let {
    checked = $bindable(),
    defaultChecked,
    onCheckedChange,
    label,
    disabled,
    required,
    name,
    id,
    class: className,
    "aria-label": ariaLabel,
  }: SwitchProps = $props();
</script>

<!--
  Ark's Switch.Root *is* the <label>, so the wrapper element and the interactive
  root are one and the same.

  `checked` is bindable so `bind:checked` works the way a Svelte consumer
  expects, and `onCheckedChange` is kept alongside it so the API still matches
  the React package. Ark hands the callback a details object; it is unwrapped
  here so the facade's signature is `(checked: boolean)` in both libraries.
-->
<ArkSwitch.Root
  class={clsx("switch", className)}
  bind:checked
  {defaultChecked}
  onCheckedChange={(details) => {
    checked = details.checked;
    onCheckedChange?.(details.checked);
  }}
  {disabled}
  {required}
  {name}
  {id}
>
  <ArkSwitch.Control class="switch__track">
    <ArkSwitch.Thumb class="switch__thumb" />
  </ArkSwitch.Control>
  {#if label}
    <ArkSwitch.Label class="switch__label text-default-body-large">{label}</ArkSwitch.Label>
  {/if}
  <!--
    Without a `label` the Label part isn't rendered, so Ark's `aria-labelledby`
    would point at nothing — and a dangling IDREF outranks `aria-label`.
  -->
  <ArkSwitch.HiddenInput
    aria-labelledby={label ? undefined : OMIT_ARIA}
    aria-label={label ? undefined : ariaLabel}
  />
</ArkSwitch.Root>
