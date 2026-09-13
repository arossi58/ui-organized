<script lang="ts">
  import {
    Popover, PopoverTrigger, PopoverContent, PopoverTitle, PopoverDescription, PopoverClose,
  } from "@ui-organized/svelte";
  let { contentProps = {}, ...props }: Record<string, any> = $props();
</script>

<Popover {...props}>
  <PopoverTrigger>Open</PopoverTrigger>
  <PopoverContent {...contentProps}>
    <PopoverTitle>Title</PopoverTitle>
    <PopoverDescription>Description</PopoverDescription>
    <PopoverClose>Close</PopoverClose>
  </PopoverContent>
</Popover>
