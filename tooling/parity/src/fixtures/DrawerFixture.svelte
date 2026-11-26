<script lang="ts">
  import {
    Drawer, DrawerTrigger, DrawerContent, DrawerTitle, DrawerDescription, DrawerClose, DrawerFooter,
  } from "@ui-organized/svelte";
  let { contentProps = {}, ...props }: Record<string, any> = $props();
</script>

<Drawer {...props}>
  <DrawerTrigger>Open</DrawerTrigger>
  <DrawerContent {...contentProps}>
    <DrawerTitle>Title</DrawerTitle>
    <DrawerDescription>Description</DrawerDescription>
    <DrawerFooter>
      <DrawerClose>Close</DrawerClose>
    </DrawerFooter>
  </DrawerContent>
</Drawer>
