<!--
  A scrollable container with a custom, themed scrollbar. Give the Root a bounded
  height (via `style="height: 200px"`, or a class that sets one) so its content
  can overflow.
-->
<script module lang="ts">
  import type { StyleValue } from "./ScrollArea.types.js";

  /**
   * A style record collapsed to the string the DOM attribute takes.
   *
   * Svelte's `style` attribute is a string and React's `style` prop is an
   * object, so a component that accepts both has to bridge the two somewhere.
   * Here rather than at the call site, so a props object written once works
   * against every library — see `StyleValue`.
   */
  function toStyleText(style: StyleValue | undefined): string | undefined {
    if (style == null) return undefined;
    if (typeof style === "string") return style || undefined;
    const declarations = Object.entries(style)
      .filter(([, value]) => value != null && value !== "")
      .map(([property, value]) => `${property.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}:${value}`);
    return declarations.length ? declarations.join(";") : undefined;
  }
</script>

<script lang="ts">
  import { ScrollArea as ArkScrollArea } from "@ark-ui/svelte";
  import { clsx } from "clsx";
  import type { ScrollAreaProps } from "./ScrollArea.types.js";
  import "@ui-organized/core/components/ScrollArea/ScrollArea.css";

  let { orientation = "vertical", style, class: className, children }: ScrollAreaProps = $props();

  const showVertical = $derived(orientation === "vertical" || orientation === "both");
  const showHorizontal = $derived(orientation === "horizontal" || orientation === "both");
  const styleText = $derived(toStyleText(style));
</script>

<ArkScrollArea.Root class={clsx("scroll-area", className)} style={styleText}>
  <!--
    The viewport is the element that scrolls, and a pointer drag is the only way
    to reach content below the fold unless it can take focus. Content that is
    itself focusable (links, inputs) makes this redundant but harmless; content
    that isn't — prose, a long table — depends on it.
  -->
  <ArkScrollArea.Viewport class="scroll-area__viewport" tabindex={0}>
    <ArkScrollArea.Content class="scroll-area__content">
      {@render children?.()}
    </ArkScrollArea.Content>
  </ArkScrollArea.Viewport>
  {#if showVertical}
    <ArkScrollArea.Scrollbar orientation="vertical" class="scroll-area__scrollbar">
      <ArkScrollArea.Thumb class="scroll-area__thumb" />
    </ArkScrollArea.Scrollbar>
  {/if}
  {#if showHorizontal}
    <ArkScrollArea.Scrollbar orientation="horizontal" class="scroll-area__scrollbar">
      <ArkScrollArea.Thumb class="scroll-area__thumb" />
    </ArkScrollArea.Scrollbar>
  {/if}
  {#if orientation === "both"}
    <ArkScrollArea.Corner class="scroll-area__corner" />
  {/if}
</ArkScrollArea.Root>
