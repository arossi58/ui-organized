<script lang="ts">
  import {
    Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription, DialogFooter,
  } from "@ui-organized/svelte";
  let { contentProps = {}, ...props }: Record<string, any> = $props();
</script>

<Dialog {...props}>
  <DialogTrigger>Open</DialogTrigger>
  <DialogContent {...contentProps}>
    <DialogTitle>Title</DialogTitle>
    <DialogDescription>Description</DialogDescription>
    <DialogFooter>Footer</DialogFooter>
  </DialogContent>
</Dialog>
