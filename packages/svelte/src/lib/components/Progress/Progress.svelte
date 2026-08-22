<script lang="ts">
  import { Progress as ArkProgress } from "@ark-ui/svelte";
  import { clsx } from "clsx";
  import { progressStyles } from "@ui-organized/core";
  import type { ProgressProps } from "./Progress.types.js";
  import "@ui-organized/core/components/Progress/Progress.css";

  let {
    value = null,
    max = 100,
    label,
    showValue = false,
    variant,
    size,
    shape = "linear",
    class: className,
  }: ProgressProps = $props();

  const showHeader = $derived(label != null || showValue);
  const isCircular = $derived(shape === "circular");
</script>

<ArkProgress.Root
  {value}
  {max}
  class={clsx(progressStyles({ variant, size, shape }), className)}
>
  {#if showHeader}
    <div class="progress__header text-default-body-small">
      {#if label != null}
        <ArkProgress.Label class="progress__label">
          {#if typeof label === "string"}{label}{:else}{@render label()}{/if}
        </ArkProgress.Label>
      {/if}
      <!--
        A ring has room inside it, so the value sits in the middle rather than in
        the header — see the circular branch below.
      -->
      {#if showValue && !isCircular}
        <ArkProgress.ValueText class="progress__value" />
      {/if}
    </div>
  {/if}
  {#if isCircular}
    <div class="progress__circle-wrap">
      <ArkProgress.Circle class="progress__circle">
        <ArkProgress.CircleTrack class="progress__circle-track" />
        <ArkProgress.CircleRange class="progress__circle-range" />
      </ArkProgress.Circle>
      {#if showValue}
        <ArkProgress.ValueText class="progress__circle-value text-emphasis-body-medium" />
      {/if}
    </div>
  {:else}
    <ArkProgress.Track class="progress__track">
      <ArkProgress.Range class="progress__indicator" />
    </ArkProgress.Track>
  {/if}
</ArkProgress.Root>
