<!--
  Loading placeholder. Renders a shimmering block sized to the eventual content.
  For multi-line text, pass `lines` to render a stack with a shortened last row.
-->
<script lang="ts">
  import { clsx } from "clsx";
  import { skeletonStyles } from "@ui-organized/core";
  import type { SkeletonProps } from "./Skeleton.types.js";
  import "@ui-organized/core/components/Skeleton/Skeleton.css";

  let {
    variant = "text",
    width,
    height,
    lines = 1,
    animated = true,
    class: className,
    style,
    ...rest
  }: SkeletonProps = $props();

  /** A number is treated as pixels; strings pass through as-is. */
  const toCssSize = (value?: number | string): string | undefined =>
    value == null ? undefined : typeof value === "number" ? `${value}px` : value;

  const w = $derived(toCssSize(width));
  const h = $derived(toCssSize(height));

  const declarations = (...pairs: [string, string | undefined][]): string | undefined => {
    const out = pairs.filter(([, v]) => v != null).map(([k, v]) => `${k}: ${v}`);
    return out.length ? out.join("; ") : undefined;
  };

  const isStack = $derived(variant === "text" && lines > 1);
  const ownStyle = $derived(declarations(["width", w], ["height", h]));
</script>

{#if isStack}
  <div class={clsx("skeleton-group", className)} {style} aria-hidden="true" {...rest}>
    {#each { length: lines } as _, i}
      <span
        class={skeletonStyles({ variant, animated })}
        style={declarations(["width", i === lines - 1 ? "60%" : (w ?? "100%")], ["height", h])}
      ></span>
    {/each}
  </div>
{:else}
  <span
    class={clsx(skeletonStyles({ variant, animated }), className)}
    style={[ownStyle, style].filter(Boolean).join("; ") || undefined}
    aria-hidden="true"
    {...rest}
  ></span>
{/if}
