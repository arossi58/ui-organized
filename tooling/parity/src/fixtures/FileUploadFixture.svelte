<script lang="ts">
  import { FileUpload } from "@ui-organized/svelte";
  let { ...props }: Record<string, any> = $props();
</script>

<FileUpload {...props} />
