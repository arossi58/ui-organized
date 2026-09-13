<script lang="ts">
  import { PasswordInput } from "@ui-organized/svelte";
  let { ...props }: Record<string, any> = $props();
</script>

<PasswordInput {...props} />
