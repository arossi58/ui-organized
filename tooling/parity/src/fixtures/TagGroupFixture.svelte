<script lang="ts">
  import { TagGroup } from "@ui-organized/svelte";
  let { tag, ...props }: Record<string, any> = $props();
</script>

<TagGroup {tag} {...props}>Message</TagGroup>
