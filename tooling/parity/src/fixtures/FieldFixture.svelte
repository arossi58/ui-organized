<script lang="ts">
  import { Field, FieldLabel, FieldControl, FieldDescription, FieldErrorMessage } from "@ui-organized/svelte";
  let { errorMessage, ...props }: Record<string, any> = $props();
</script>

<Field {...props}>
  <FieldLabel>Email</FieldLabel>
  <FieldControl />
  <FieldDescription>Helper</FieldDescription>
  {#if errorMessage}<FieldErrorMessage message={errorMessage} />{/if}
</Field>
