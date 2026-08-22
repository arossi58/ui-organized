<script lang="ts">
  import { Field as ArkField } from "@ark-ui/svelte";
  import { clsx } from "clsx";
  import type { FieldLabelProps } from "./Field.types.js";

  let { class: className, children, ...rest }: FieldLabelProps = $props();
</script>

<ArkField.Label class={clsx("field__label", className)} {...rest}>
  {@render children?.()}
</ArkField.Label>
