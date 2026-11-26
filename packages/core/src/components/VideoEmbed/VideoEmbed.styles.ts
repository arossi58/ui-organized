import { cva, type VariantProps } from "class-variance-authority";

/**
 * A video behind a poster: nothing loads until the reader presses play, which
 * keeps third-party players off the page until they are wanted. `background`
 * is the muted, looping, decorative form a hero uses instead.
 */
export const videoEmbedStyles = cva("video-embed", {
  variants: {
    background: {
      true: "video-embed--background",
    },
    playing: {
      true: "video-embed--playing",
    },
  },
});

export type VideoEmbedVariants = VariantProps<typeof videoEmbedStyles>;

/** File extensions a `<video>` plays; anything else is embedded as an iframe. */
const VIDEO_FILE = /\.(mp4|webm|ogg|ogv|mov|m4v)(?:[?#]|$)/i;

/** `video` for a file a `<video>` element plays, `iframe` for a player page. */
export function videoEmbedKind(src: string, type?: "video" | "iframe"): "video" | "iframe" {
  return type ?? (VIDEO_FILE.test(src) ? "video" : "iframe");
}

/** Permissions an embedded player asks for, so it can autoplay once pressed and go full screen. */
export const VIDEO_EMBED_ALLOW = "autoplay; fullscreen; picture-in-picture";
