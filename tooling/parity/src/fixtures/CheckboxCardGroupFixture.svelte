<script lang="ts">
  import { CheckboxCardGroup } from "@ui-organized/svelte";
  let { ...props }: Record<string, any> = $props();
</script>

<CheckboxCardGroup {...(props as any)} />
