<script lang="ts">
  import { ImageCropper } from "@ui-organized/svelte";
  let { ...props }: Record<string, any> = $props();
</script>

<ImageCropper {...props} />
