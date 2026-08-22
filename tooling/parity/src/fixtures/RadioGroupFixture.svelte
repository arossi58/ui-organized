<script lang="ts">
  import { RadioGroup } from "@ui-organized/svelte";
  let { ...props }: Record<string, unknown> = $props();
</script>

<RadioGroup {...(props as any)} />
