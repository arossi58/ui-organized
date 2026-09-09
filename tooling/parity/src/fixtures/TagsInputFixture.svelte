<script lang="ts">
  import { TagsInput } from "@ui-organized/svelte";
  let { ...props }: Record<string, any> = $props();
</script>

<TagsInput {...props} />
