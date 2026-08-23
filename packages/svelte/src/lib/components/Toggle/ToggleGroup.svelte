<!-- Joins a set of `<Toggle>` buttons into one single- or multi-select control. -->
<script lang="ts">
  import { ToggleGroup as ArkToggleGroup } from "@ark-ui/svelte";
  import { clsx } from "clsx";
  import type { ToggleGroupProps } from "./Toggle.types.js";
  import "@ui-organized/core/components/Toggle/Toggle.css";

  let {
    value = $bindable(),
    defaultValue,
    onValueChange,
    multiple,
    disabled,
    orientation,
    class: className,
    children,
    ...rest
  }: ToggleGroupProps = $props();
</script>

<ArkToggleGroup.Root
  bind:value
  {defaultValue}
  onValueChange={(details) => {
    value = details.value;
    onValueChange?.(details.value);
  }}
  {multiple}
  {disabled}
  {orientation}
  class={clsx("toggle-group", className)}
  {...rest}
>
  {@render children?.()}
</ArkToggleGroup.Root>
