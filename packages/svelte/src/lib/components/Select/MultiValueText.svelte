<!--
  The chosen values as text inside the trigger: the placeholder when there are
  none, otherwise visually hidden, because it is what names the selection for a
  screen reader while the tags beside it are aria-hidden.
-->
<script lang="ts">
  import { Select as ArkSelect, useSelectContext } from "@ark-ui/svelte";
  import { clsx } from "clsx";

  let { placeholder }: { placeholder?: string } = $props();
  const select = useSelectContext();
</script>

<ArkSelect.ValueText
  class={clsx("select-field__value", select().value.length > 0 && "select-field__value--hidden")}
  {placeholder}
/>
