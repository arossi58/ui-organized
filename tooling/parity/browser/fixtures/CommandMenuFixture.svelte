<script lang="ts">
  import { CommandMenu } from "@ui-organized/svelte";
  let { ...props }: Record<string, any> = $props();
</script>

<CommandMenu {...(props as any)} />
