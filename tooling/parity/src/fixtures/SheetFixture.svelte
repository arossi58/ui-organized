<script lang="ts">
  import {
    Sheet, SheetTrigger, SheetContent, SheetTitle, SheetDescription, SheetClose, SheetFooter,
  } from "@ui-organized/svelte";
  let { contentProps = {}, ...props }: Record<string, any> = $props();
</script>

<Sheet {...props}>
  <SheetTrigger>Open</SheetTrigger>
  <SheetContent {...contentProps}>
    <SheetTitle>Title</SheetTitle>
    <SheetDescription>Description</SheetDescription>
    <SheetFooter>
      <SheetClose>Close</SheetClose>
    </SheetFooter>
  </SheetContent>
</Sheet>
