<script lang="ts">
  import { onMount, tick } from "svelte";
  import { clsx } from "clsx";
  import { VIDEO_EMBED_ALLOW, videoEmbedKind, videoEmbedStyles } from "@ui-organized/core";
  import Dialog from "../Dialog/Dialog.svelte";
  import DialogContent from "../Dialog/DialogContent.svelte";
  import DialogTitle from "../Dialog/DialogTitle.svelte";
  import type { VideoEmbedProps } from "./VideoEmbed.types.js";
  import "@ui-organized/core/components/VideoEmbed/VideoEmbed.css";

  let {
    src,
    title,
    poster,
    type,
    aspectRatio,
    lightbox = false,
    background = false,
    playLabel,
    captions,
    captionsLang = "en",
    class: className,
    ...rest
  }: VideoEmbedProps = $props();

  const kind = $derived(videoEmbedKind(src, type));
  let playing = $state(false);
  let open = $state(false);
  let media = $state<HTMLVideoElement | HTMLIFrameElement | null>(null);

  // A decorative loop starts after mount, and only without reduced motion, so
  // the server and the first client render are the same paused element.
  onMount(() => {
    if (!background || !(media instanceof HTMLVideoElement)) return;
    if (typeof window.matchMedia !== "function") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    void media.play?.()?.catch(() => {});
  });

  async function play() {
    if (lightbox) {
      open = true;
      return;
    }
    playing = true;
    // The poster button is gone once the player replaces it, so focus follows.
    await tick();
    media?.focus();
  }
</script>

{#snippet player()}
  {#if kind === "video"}
    <!-- Captions are the caller's `captions` file; Svelte cannot see that statically. -->
    <!-- svelte-ignore a11y_media_has_caption -->
    <video bind:this={media} class="video-embed__media" {src} {poster} controls autoplay playsinline aria-label={title}>
      {#if captions}<track kind="captions" src={captions} srclang={captionsLang} default />{/if}
    </video>
  {:else}
    <iframe bind:this={media} class="video-embed__media" {src} {title} allow={VIDEO_EMBED_ALLOW} allowfullscreen
    ></iframe>
  {/if}
{/snippet}

{#if background}
  <div class={clsx(videoEmbedStyles({ background: true }), className)} style:aspect-ratio={aspectRatio} {...rest}>
    <!-- Decorative and muted, with nothing to caption. -->
    <!-- svelte-ignore a11y_media_has_caption -->
    <video
      bind:this={media}
      class="video-embed__media"
      {src}
      {poster}
      muted
      loop
      playsinline
      preload="metadata"
      aria-hidden="true"
      tabindex="-1"
    ></video>
  </div>
{:else}
  <div
    class={clsx(videoEmbedStyles({ playing: playing && !lightbox }), className)}
    style:aspect-ratio={aspectRatio}
    {...rest}
  >
    {#if playing && !lightbox}
      {@render player()}
    {:else}
      <button
        type="button"
        class="video-embed__poster"
        aria-label={playLabel ?? `Play ${title}`}
        aria-haspopup={lightbox ? "dialog" : undefined}
        onclick={play}
      >
        {#if poster}<img class="video-embed__image" src={poster} alt="" />{/if}
        <span class="video-embed__play" aria-hidden="true"></span>
      </button>
    {/if}
    {#if lightbox}
      <Dialog bind:open>
        <DialogContent size="fullscreen">
          <DialogTitle class="video-embed__sr">{title}</DialogTitle>
          {#if open}<div class="video-embed__frame">{@render player()}</div>{/if}
        </DialogContent>
      </Dialog>
    {/if}
  </div>
{/if}
