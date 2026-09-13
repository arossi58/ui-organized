<!--
  Error message wired to the field's validity. Renders through the shared
  FieldError (icon + tinted pill). Ark's ErrorText shows only while the Field is
  invalid, so no explicit match condition is needed.
-->
<script setup lang="ts">
import { Field as ArkField } from "@ark-ui/vue";
import FieldError from "../FieldError/FieldError.vue";
import type { FieldErrorMessageProps } from "./Field.types.js";

defineProps<FieldErrorMessageProps>();
</script>

<template>
  <ArkField.ErrorText as-child>
    <FieldError :message="message"><slot /></FieldError>
  </ArkField.ErrorText>
</template>
