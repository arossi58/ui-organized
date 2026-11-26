import type * as React from "react";

export interface VideoEmbedProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  /** A video file, or the embed URL of a player page. */
  src: string;
  /** What the video is. Names the player, and the play button as "Play {title}". */
  title: string;
  /** An image shown until the video plays. */
  poster?: string;
  /**
   * `video` plays a file in a `<video>`; `iframe` embeds a player page. Inferred
   * from `src`: `.mp4`, `.webm`, `.ogg` and `.mov` are video, anything else an
   * iframe. For an iframe that should start on play, put the provider's own
   * autoplay parameter in `src`.
   */
  type?: "video" | "iframe";
  /** The box's CSS `aspect-ratio`. Defaults to `16 / 9`. */
  aspectRatio?: string;
  /** Play in a full-screen dialog instead of in place. */
  lightbox?: boolean;
  /**
   * A muted, looping, decorative video with no controls and no poster button.
   * It is hidden from assistive tech, and stays on its first frame under
   * reduced motion. A `video` file only.
   */
  background?: boolean;
  /**
   * A WebVTT captions file for a `video`, shown by default. An iframe player
   * carries its own captions.
   */
  captions?: string;
  /** The captions' language, as a BCP 47 tag. Defaults to "en". */
  captionsLang?: string;
  /** The play button's accessible name. Defaults to "Play {title}". */
  playLabel?: string;
}
