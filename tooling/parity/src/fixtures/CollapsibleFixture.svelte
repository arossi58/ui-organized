<script lang="ts">
  import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@ui-organized/svelte";
  let {
    triggerLabel = "Details",
    body = "Panel body",
    ...props
  }: Record<string, any> = $props();
</script>

<Collapsible {...props}>
  <CollapsibleTrigger>{triggerLabel}</CollapsibleTrigger>
  <CollapsibleContent>{body}</CollapsibleContent>
</Collapsible>
