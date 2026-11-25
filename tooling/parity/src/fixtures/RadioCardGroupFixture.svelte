<script lang="ts">
  import { RadioCardGroup } from "@ui-organized/svelte";
  let { ...props }: Record<string, any> = $props();
</script>

<RadioCardGroup {...(props as any)} />
