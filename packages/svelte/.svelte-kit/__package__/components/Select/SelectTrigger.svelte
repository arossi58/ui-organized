<!--
  The trigger, split out so it can read the select's open state from context —
  `Select` itself renders the Root, so it sits above that context. React splits
  it for exactly the same reason.
-->
<script lang="ts">
  import type { Snippet } from "svelte";
  import { Select as ArkSelect, useSelectContext } from "@ark-ui/svelte";
  import { OMIT_ARIA, popupControls } from "@ui-organized/core";

  let { hasLabel, children }: { hasLabel: boolean; children: Snippet } = $props();

  const select = useSelectContext();
</script>

<ArkSelect.Trigger
  class="select-field__trigger text-default-body-large"
  {...popupControls(select().open)}
  aria-labelledby={hasLabel ? undefined : OMIT_ARIA}
>
  {@render children()}
</ArkSelect.Trigger>
