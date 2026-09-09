<script setup lang="ts">
import { Field, FieldLabel, FieldControl, FieldDescription, FieldErrorMessage } from "@ui-organized/vue";
defineProps<{ errorMessage?: string }>();
</script>

<template>
  <Field v-bind="$attrs">
    <FieldLabel>Email</FieldLabel>
    <FieldControl />
    <FieldDescription>Helper</FieldDescription>
    <FieldErrorMessage v-if="errorMessage" :message="errorMessage" />
  </Field>
</template>
