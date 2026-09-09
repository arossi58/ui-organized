<script lang="ts">
  import { ColorPicker } from "@ui-organized/svelte";
  let { ...props }: Record<string, any> = $props();
</script>

<ColorPicker {...props} />
