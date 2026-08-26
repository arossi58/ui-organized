<script setup lang="ts">
import {
  AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogConfirm,
} from "@ui-organized/vue";
defineProps<{
  contentProps?: Record<string, unknown>;
  confirmProps?: Record<string, unknown>;
}>();
</script>

<template>
  <AlertDialog v-bind="$attrs">
    <AlertDialogTrigger>Delete</AlertDialogTrigger>
    <AlertDialogContent v-bind="contentProps">
      <AlertDialogTitle>Title</AlertDialogTitle>
      <AlertDialogDescription>Description</AlertDialogDescription>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <AlertDialogConfirm v-bind="confirmProps">Confirm</AlertDialogConfirm>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
