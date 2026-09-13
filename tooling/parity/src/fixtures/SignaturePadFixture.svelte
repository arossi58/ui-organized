<script lang="ts">
  import { SignaturePad } from "@ui-organized/svelte";
  let { ...props }: Record<string, any> = $props();
</script>

<SignaturePad {...props} />
