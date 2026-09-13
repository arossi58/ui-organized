<script lang="ts">
  import { Field as ArkField } from "@ark-ui/svelte";
  import { clsx } from "clsx";
  import type { FieldDescriptionProps } from "./Field.types.js";

  let { class: className, children, ...rest }: FieldDescriptionProps = $props();
</script>

<ArkField.HelperText class={clsx("field__description", className)} {...rest}>
  {@render children?.()}
</ArkField.HelperText>
