<script lang="ts">
  import { Menu as ArkMenu } from "@ark-ui/svelte";
  import type { MenuRadioGroupProps } from "./Menu.types.js";

  let { value = $bindable(), onValueChange, children }: MenuRadioGroupProps = $props();
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
