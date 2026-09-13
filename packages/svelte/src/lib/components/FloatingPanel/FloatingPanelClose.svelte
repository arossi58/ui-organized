<!-- Closes the panel when activated. -->
<script lang="ts">
  import { FloatingPanel as ArkFloatingPanel } from "@ark-ui/svelte";
  import { clsx } from "clsx";
  import Icon from "../Icon/Icon.svelte";
  import type { FloatingPanelCloseProps } from "./FloatingPanel.types.js";

  /** Header affordances stay a fixed small edge — they mark the chrome rather
   *  than scaling with the panel's body text. */
  const HEADER_ICON_SIZE = 16;

  let { class: className, children, ...rest }: FloatingPanelCloseProps = $props();
</script>

<ArkFloatingPanel.CloseTrigger
  class={clsx("floating-panel__close", className)}
  aria-label="Close panel"
  {...rest}
>
  {#if children}{@render children()}{:else}<Icon name="close" size={HEADER_ICON_SIZE} />{/if}
</ArkFloatingPanel.CloseTrigger>
