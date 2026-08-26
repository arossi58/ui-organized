<script lang="ts">
  import { Splitter as ArkSplitter } from "@ark-ui/svelte";
  import { clsx } from "clsx";
  import { splitterStyles } from "@ui-organized/core";
  import type { SplitterProps } from "./Splitter.types.js";
  import "@ui-organized/core/components/Splitter/Splitter.css";

  let {
    panels,
    size = $bindable(),
    defaultSize,
    onResize,
    onResizeEnd,
    orientation = "horizontal",
    variant,
    class: className,
  }: SplitterProps = $props();

  /* The machine takes its own panel descriptors, not our render data — strip
     `content` so a changed snippet never looks like a changed constraint. */
  const panelData = $derived(
    panels.map(({ id, minSize, maxSize, collapsible, collapsedSize }) => ({
      id,
      minSize,
      maxSize,
      collapsible,
      collapsedSize,
    })),
  );
</script>

<!--
  `bind:size` rather than a plain prop: Ark's own Root declares `size` bindable
  and writes the new layout back on every resize, so binding is what keeps an
  uncontrolled splitter's `bind:size` reading the sizes the user dragged to.
-->
<ArkSplitter.Root
  class={clsx(splitterStyles({ orientation, variant }), className)}
  panels={panelData}
  bind:size
  {defaultSize}
  onResize={onResize && ((details) => onResize(details.size))}
  onResizeEnd={onResizeEnd && ((details) => onResizeEnd(details.size))}
  {orientation}
>
  {#each panels as panel, index (panel.id)}
    <ArkSplitter.Panel id={panel.id} class="splitter__panel">
      {#if typeof panel.content === "string"}{panel.content}{:else}{@render panel.content?.()}{/if}
    </ArkSplitter.Panel>
    <!--
      A handle sits between adjacent panels, so the last panel has none.
      zag identifies it by the literal "before:after" pair of ids.
    -->
    {#if index < panels.length - 1}
      <ArkSplitter.ResizeTrigger
        id={`${panel.id}:${panels[index + 1]!.id}`}
        class="splitter__trigger"
      >
        <span class="splitter__grip" aria-hidden="true"></span>
      </ArkSplitter.ResizeTrigger>
    {/if}
  {/each}
</ArkSplitter.Root>
