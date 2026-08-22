<!--
  Renders the design-system Divider as the separator surface; Ark's Separator
  merges its semantics and props onto it via asChild. The `menu__separator` class
  only adds the menu's block spacing around the rule.
-->
<script lang="ts">
  import { Menu as ArkMenu } from "@ark-ui/svelte";
  import { clsx } from "clsx";
  import Divider from "../Divider/Divider.svelte";
  import type { MenuSeparatorProps } from "./Menu.types.js";

  let { class: className }: MenuSeparatorProps = $props();
</script>

<ArkMenu.Separator>
  {#snippet asChild(props)}
    <Divider {...props()} class={clsx("menu__separator", className)} />
  {/snippet}
</ArkMenu.Separator>
