<!--
  The area that opens the menu on right-click (or long-press).

  Ark's ContextTrigger renders a <button>; the wiring is projected onto a plain
  <div> so the target stays an arbitrary content area with no button chrome and
  no nested-interactive markup.

  The caller's attributes go *through* Ark's props function rather than being
  spread after it. Ark's own merge is what chains the two `oncontextmenu`
  handlers; spreading second would replace the one that opens the menu, and the
  component would render correctly and do nothing.
-->
<script lang="ts">
  import { Menu as ArkMenu } from "@ark-ui/svelte";
  import type { ContextMenuTriggerProps } from "./ContextMenu.types.js";

  let { children, ...rest }: ContextMenuTriggerProps = $props();
</script>

<ArkMenu.ContextTrigger>
  {#snippet asChild(props)}
    <div {...props(rest)}>{@render children?.()}</div>
  {/snippet}
</ArkMenu.ContextTrigger>
