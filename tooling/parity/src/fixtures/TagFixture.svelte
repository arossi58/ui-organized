<script lang="ts">
  import { Tag } from "@ui-organized/svelte";
  // `removable` stands for the remove handler; see cases/Tag.tsx.
  let { removable = false, ...props }: Record<string, any> = $props();
</script>

<Tag {...props} onremove={removable ? () => {} : undefined}>Label</Tag>
