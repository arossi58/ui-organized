<script lang="ts">
  import { NavProvider, NavSubItem } from "@ui-organized/svelte";
  let { rail, ...props }: Record<string, any> = $props();
</script>

<NavProvider collapsed={rail}>
  <NavSubItem label="Weekly" {...props} />
</NavProvider>
