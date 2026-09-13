<script lang="ts">
  import {
    Dialog, DialogTrigger, DialogContent, DialogTitle, Select,
  } from "@ui-organized/svelte";

  let { options = [] }: { options?: { value: string; label: string }[] } = $props();
</script>

<Dialog>
  <DialogTrigger>Open</DialogTrigger>
  <DialogContent>
    <DialogTitle>Title</DialogTitle>
    <Select {options} label="Fruit" />
  </DialogContent>
</Dialog>
