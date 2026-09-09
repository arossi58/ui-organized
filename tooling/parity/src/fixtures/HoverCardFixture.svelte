<script lang="ts">
  import { HoverCard, HoverCardTrigger, HoverCardContent } from "@ui-organized/svelte";
  let { contentProps = {}, ...props }: Record<string, any> = $props();
</script>

<HoverCard {...props}>
  <HoverCardTrigger>Profile</HoverCardTrigger>
  <HoverCardContent {...contentProps}>Preview</HoverCardContent>
</HoverCard>
