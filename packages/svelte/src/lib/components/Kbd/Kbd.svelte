<!--
  A key, or a shortcut as a row of keys. A key drawn as a symbol carries its
  name as visually hidden text, so a screen reader says "Command K". React's
  Kbd renders the same markup.
-->
<script lang="ts">
  import { clsx } from "clsx";
  import { detectPlatform, kbdLabels, kbdStyles, type KeyPlatform } from "@ui-organized/core";
  import type { KbdProps } from "./Kbd.types.js";
  import "@ui-organized/core/components/Kbd/Kbd.css";

  let { keys, children, size, platform = "auto", class: className, ...rest }: KbdProps = $props();

  // `other` until mounted, so the first render matches what the server drew.
  let detected = $state<KeyPlatform>("other");
  $effect(() => {
    if (platform === "auto") detected = detectPlatform();
  });
  const resolved = $derived(platform === "auto" ? detected : platform);
</script>

<kbd class={clsx(kbdStyles({ size }), className)} {...rest}>{#if keys}{#each kbdLabels(keys, resolved) as label, i (i)}<kbd class="kbd__key">{#if label.glyph === label.name}{label.glyph}{:else}<span aria-hidden="true">{label.glyph}</span><span class="kbd__name">{label.name}</span>{/if}</kbd>{/each}{:else}<kbd class="kbd__key">{@render children?.()}</kbd>{/if}</kbd>
