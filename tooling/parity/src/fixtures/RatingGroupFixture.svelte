<script lang="ts">
  import { RatingGroup } from "@ui-organized/svelte";
  let { ...props }: Record<string, any> = $props();
</script>

<RatingGroup {...props} />
