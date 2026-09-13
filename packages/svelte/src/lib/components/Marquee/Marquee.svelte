<script lang="ts">
  import { Marquee as ArkMarquee } from "@ark-ui/svelte";
  import { clsx } from "clsx";
  import { marqueeStyles } from "@ui-organized/core";
  import type { MarqueeProps } from "./Marquee.types.js";
  import "@ui-organized/core/components/Marquee/Marquee.css";

  /** Authored default gap. zag resolves it into `--marquee-spacing` at runtime,
   *  so the value it computes with is not a token — but the one we author is. */
  const DEFAULT_SPACING = "var(--spacing-space-04)";

  /**
   * The machine has no `orientation`; it has `side`, which is the direction of
   * travel and implies the axis. The library uses `orientation` everywhere else,
   * so the public prop keeps that name and the default side for each axis is
   * chosen here. `reverse` flips the direction within the axis.
   */
  const SIDE_BY_ORIENTATION = {
    horizontal: "start",
    vertical: "top",
  } as const;

  let {
    items,
    speed,
    delay,
    orientation = "horizontal",
    reverse,
    spacing = DEFAULT_SPACING,
    autoFill = true,
    pauseOnInteraction,
    defaultPaused,
    loopCount,
    showEdges = true,
    class: className,
  }: MarqueeProps = $props();

  /* Reduced motion is handled entirely in Marquee.css, which drops the
     animation under `prefers-reduced-motion: reduce` — continuous motion with
     no way to stop it is a WCAG 2.2.2 failure. Forcing `defaultPaused` here
     instead would make the component disagree with its own stylesheet and
     would leak a media query into SSR, where there is no media to query. */
</script>

<ArkMarquee.Root
  class={clsx(marqueeStyles({ orientation }), className)}
  {speed}
  {delay}
  side={SIDE_BY_ORIENTATION[orientation]}
  {reverse}
  {spacing}
  {autoFill}
  {pauseOnInteraction}
  {defaultPaused}
  {loopCount}
>
  {#if showEdges}
    <ArkMarquee.Edge side="start" class="marquee__edge" />
    <ArkMarquee.Edge side="end" class="marquee__edge" />
  {/if}
  <ArkMarquee.Viewport class="marquee__viewport">
    <!--
      One Content, not one per copy. Ark's Content renders itself
      `api.contentCount` times — the machine decides how many passes are needed
      to fill the track from the measured content and `autoFill` — and tags
      every duplicate `data-clone` so it stays out of the accessibility tree.
      Looping here would duplicate the duplicates.
    -->
    <ArkMarquee.Content class="marquee__content">
      {#each items as item (item.id)}
        <ArkMarquee.Item class="marquee__item">
          {#if typeof item.content === "string"}{item.content}{:else}{@render item.content?.()}{/if}
        </ArkMarquee.Item>
      {/each}
    </ArkMarquee.Content>
  </ArkMarquee.Viewport>
</ArkMarquee.Root>
