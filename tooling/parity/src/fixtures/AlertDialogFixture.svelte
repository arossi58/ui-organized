<script lang="ts">
  import {
    AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogTitle,
    AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogConfirm,
  } from "@ui-organized/svelte";
  let { contentProps = {}, confirmProps = {}, ...props }: Record<string, any> = $props();
</script>

<AlertDialog {...props}>
  <AlertDialogTrigger>Delete</AlertDialogTrigger>
  <AlertDialogContent {...contentProps}>
    <AlertDialogTitle>Title</AlertDialogTitle>
    <AlertDialogDescription>Description</AlertDialogDescription>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogConfirm {...confirmProps}>Confirm</AlertDialogConfirm>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
