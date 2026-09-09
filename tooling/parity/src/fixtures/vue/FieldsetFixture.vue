<script setup lang="ts">
import { Field, FieldControl, FieldLabel, Fieldset, FieldsetLegend } from "@ui-organized/vue";
</script>

<template>
  <Fieldset v-bind="$attrs">
    <FieldsetLegend>Contact</FieldsetLegend>
    <Field>
      <FieldLabel>Email</FieldLabel>
      <FieldControl />
    </Field>
  </Fieldset>
</template>
