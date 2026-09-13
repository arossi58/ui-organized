<!--
  Renders the design-system Divider as the separator surface; Ark's Separator
  merges its semantics and props onto it via asChild. The
  `context-menu__separator` class only adds the menu's block spacing around the
  rule.

  `asChild` works here, unlike in the Vue library, where Ark builds `ark.hr` with
  `null` children and the projected element is silently dropped. Ark Svelte hands
  the snippet to its polymorphic factory before it ever renders a tag, so the
  projection arrives — the same reason ../Menu/MenuSeparator.svelte can do this.
-->
<script lang="ts">
  import { Menu as ArkMenu } from "@ark-ui/svelte";
  import { clsx } from "clsx";
  import Divider from "../Divider/Divider.svelte";
  import type { ContextMenuSeparatorProps } from "./ContextMenu.types.js";

  let { class: className }: ContextMenuSeparatorProps = $props();
</script>

<ArkMenu.Separator>
  {#snippet asChild(props)}
    <Divider {...props()} class={clsx("context-menu__separator", className)} />
  {/snippet}
</ArkMenu.Separator>
