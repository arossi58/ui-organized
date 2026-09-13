<!--
  Form field wrapper. Associates a label, control, description and error message
  through Ark UI's Field, so validation state flows to all parts via
  `aria-describedby` / `[data-invalid]`.
-->
<script lang="ts">
  import { Field as ArkField } from "@ark-ui/svelte";
  import { clsx } from "clsx";
  import { fieldStyles } from "@ui-organized/core";
  import type { FieldProps } from "./Field.types.js";
  import "@ui-organized/core/components/Field/Field.css";

  let { layout, class: className, children, ...rest }: FieldProps = $props();
</script>

<ArkField.Root class={clsx(fieldStyles({ layout }), className)} {...rest}>
  {@render children?.()}
</ArkField.Root>
