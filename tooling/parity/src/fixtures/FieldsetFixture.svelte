<script lang="ts">
  import { Field, FieldControl, FieldLabel, Fieldset, FieldsetLegend } from "@ui-organized/svelte";
  let props: Record<string, any> = $props();
</script>

<Fieldset {...props}>
  <FieldsetLegend>Contact</FieldsetLegend>
  <Field>
    <FieldLabel>Email</FieldLabel>
    <FieldControl />
  </Field>
</Fieldset>
