<!--
  The chosen values as tags on one line, with a "+N" for those that do not fit.
  Every tag renders so it can be measured; the overflow is marked and hidden by
  CSS. Without layout (the server, jsdom) nothing is measured and all show.
  React's SelectTags does the same.
-->
<script lang="ts">
  import { useSelectContext } from "@ark-ui/svelte";
  import { clsx } from "clsx";
  import { measureTagRow, tagStyles } from "@ui-organized/core";
  import Icon from "../Icon/Icon.svelte";
  import { glyph } from "../../icons/glyph.js";
  import type { SelectOption } from "./Select.types.js";

  let { options }: { options: SelectOption[] } = $props();

  const select = useSelectContext();
  let row = $state<HTMLDivElement | null>(null);
  let fits = $state<number | null>(null);

  const chosen = $derived(
    select()
      .value.map((v) => options.find((o) => o.value === v))
      .filter((o): o is SelectOption => o != null),
  );

  $effect(() => {
    // Re-measure whenever the selection changes, and whenever anything resizes.
    void chosen.length;
    const el = row;
    if (!el) return;
    const measure = () => (fits = measureTagRow(el, Number.parseFloat(getComputedStyle(el).columnGap) || 0));
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    for (const tag of el.querySelectorAll(":scope > [data-tag]")) observer.observe(tag);
    return () => observer.disconnect();
  });

  const shown = $derived(fits ?? chosen.length);
  const more = $derived(chosen.length - shown);
  const tag = tagStyles({ variant: "neutral", size: "sm", appearance: "subtle" });
</script>

<div class="select-field__tags" aria-hidden="true" bind:this={row}>
  {#each chosen as option, i (option.value)}
    <span class={tag} data-tag="" data-overflowed={i >= shown ? "" : undefined}>
      <span class="tag__label">{option.label}</span>
      <button
        type="button"
        class="tag__remove"
        tabindex="-1"
        aria-label={`Remove ${option.label}`}
        onpointerdown={(event) => event.preventDefault()}
        onclick={() => select().clearValue(option.value)}
      >
        <Icon name={glyph("close")} size={12} />
      </button>
    </span>
  {/each}
  {#if more > 0}
    <span class={clsx(tag, "select-field__tag-more")}><span class="tag__label">+{more}</span></span>
  {/if}
</div>
