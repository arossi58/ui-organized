<!-- Heading for the panel, and the thing that names it. -->
<script lang="ts">
  import { FloatingPanel as ArkFloatingPanel } from "@ark-ui/svelte";
  import { clsx } from "clsx";
  import type { FloatingPanelTitleProps } from "./FloatingPanel.types.js";

  let { class: className, children, ...rest }: FloatingPanelTitleProps = $props();
</script>

<ArkFloatingPanel.Title
  class={clsx("floating-panel__title", "text-strong-body-large", className)}
  {...rest}
>
  {@render children?.()}
</ArkFloatingPanel.Title>
