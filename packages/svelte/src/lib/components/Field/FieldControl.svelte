<script lang="ts">
  import { Field as ArkField } from "@ark-ui/svelte";
  import { clsx } from "clsx";
  import type { FieldControlProps } from "./Field.types.js";

  let { class: className, value = $bindable(), ...rest }: FieldControlProps = $props();
</script>

<ArkField.Input class={clsx("field__control", className)} bind:value {...rest} />
