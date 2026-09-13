<script lang="ts">
  import { Menu as ArkMenu } from "@ark-ui/svelte";
  import type { ContextMenuRadioGroupProps } from "./ContextMenu.types.js";

  let { value = $bindable(), onValueChange, children }: ContextMenuRadioGroupProps = $props();
</script>

<ArkMenu.RadioItemGroup
  {value}
  onValueChange={(details) => {
    value = details.value;
    onValueChange?.(details.value);
  }}
>
  {@render children?.()}
</ArkMenu.RadioItemGroup>
