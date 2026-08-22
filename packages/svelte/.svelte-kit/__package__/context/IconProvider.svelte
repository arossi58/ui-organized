<!--
  Sets the icon configuration for everything below it.

  Held as an accessor rather than a snapshot so a provider driven by reactive
  props keeps its consumers current — a theme switcher flipping `style` to
  "solid" updates every icon already on the page.
-->
<script lang="ts">
  import type { Snippet } from "svelte";
  import { DEFAULT_ICON_CONFIG, type IconConfig } from "@ui-organized/core";
  import type { IconComponent } from "../icons/registry.js";
  import { setIconConfig } from "./iconContext.svelte.js";

  interface IconProviderProps extends Partial<IconConfig<IconComponent>> {
    children: Snippet;
  }

  let {
    library = DEFAULT_ICON_CONFIG.library,
    style = DEFAULT_ICON_CONFIG.style,
    strokeAdjustment = DEFAULT_ICON_CONFIG.strokeAdjustment,
    baseSize = DEFAULT_ICON_CONFIG.baseSize,
    baseStroke = DEFAULT_ICON_CONFIG.baseStroke,
    icons,
    children,
  }: IconProviderProps = $props();

  const config = $derived<IconConfig<IconComponent>>({
    library,
    style,
    strokeAdjustment,
    baseSize,
    baseStroke,
    icons,
  });

  setIconConfig({
    get current() {
      return config;
    },
  });
</script>

{@render children()}
