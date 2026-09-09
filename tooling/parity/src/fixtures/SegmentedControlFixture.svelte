<script lang="ts">
  import { SegmentedControl } from "@ui-organized/svelte";
  let { ...props }: Record<string, any> = $props();
</script>

<SegmentedControl {...props} />
