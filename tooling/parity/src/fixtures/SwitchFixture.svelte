<script lang="ts">
  import { Switch } from "@ui-organized/svelte";
  let { ...props }: Record<string, unknown> = $props();
</script>

<Switch {...props} />
