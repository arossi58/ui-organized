<!-- Groups related fields under a shared legend. -->
<script lang="ts">
  import { Fieldset as ArkFieldset } from "@ark-ui/svelte";
  import { clsx } from "clsx";
  import type { FieldsetProps } from "./Field.types.js";

  let { class: className, children, ...rest }: FieldsetProps = $props();
</script>

<ArkFieldset.Root class={clsx("fieldset", className)} {...rest}>
  {@render children?.()}
</ArkFieldset.Root>
