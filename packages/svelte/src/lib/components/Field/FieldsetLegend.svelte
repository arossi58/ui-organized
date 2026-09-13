<script lang="ts">
  import { Fieldset as ArkFieldset } from "@ark-ui/svelte";
  import { clsx } from "clsx";
  import type { FieldsetLegendProps } from "./Field.types.js";

  let { class: className, children, ...rest }: FieldsetLegendProps = $props();
</script>

<ArkFieldset.Legend class={clsx("fieldset__legend", className)} {...rest}>
  {@render children?.()}
</ArkFieldset.Legend>
