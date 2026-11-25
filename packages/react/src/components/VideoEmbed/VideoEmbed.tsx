import { useEffect, useRef, useState } from "react";
import { clsx } from "clsx";
import { VIDEO_EMBED_ALLOW, videoEmbedKind, videoEmbedStyles } from "@ui-organized/core";
import { Dialog, DialogContent, DialogTitle } from "../Dialog/index.js";
import type { VideoEmbedProps } from "./VideoEmbed.types.js";
import "@ui-organized/core/components/VideoEmbed/VideoEmbed.css";

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

export function VideoEmbed({
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
  className,
  style,
  ...props
}: VideoEmbedProps) {
  const kind = videoEmbedKind(src, type);
  const [playing, setPlaying] = useState(false);
  const [open, setOpen] = useState(false);
  const mediaRef = useRef<HTMLVideoElement & HTMLIFrameElement>(null);
  const boxStyle = aspectRatio ? { ...style, aspectRatio } : style;

  // A decorative loop starts after mount, and only without reduced motion, so
  // the server and the first client render are the same paused element.
  useEffect(() => {
    if (!background) return;
    const video = mediaRef.current;
    if (!video || typeof window.matchMedia !== "function") return;
    if (window.matchMedia(REDUCED_MOTION).matches) return;
    void video.play?.()?.catch(() => {});
  }, [background]);

  // The poster button is gone once the player replaces it, so focus follows.
  useEffect(() => {
    if (playing) mediaRef.current?.focus();
  }, [playing]);

  if (background) {
    return (
      <div className={clsx(videoEmbedStyles({ background: true }), className)} style={boxStyle} {...props}>
        <video
          ref={mediaRef}
          className="video-embed__media"
          src={src}
          poster={poster}
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
          tabIndex={-1}
        />
      </div>
    );
  }

  const player =
    kind === "video" ? (
      <video
        ref={mediaRef}
        className="video-embed__media"
        src={src}
        poster={poster}
        controls
        autoPlay
        playsInline
        aria-label={title}
      >
        {captions && <track kind="captions" src={captions} srcLang={captionsLang} default />}
      </video>
    ) : (
      <iframe
        ref={mediaRef}
        className="video-embed__media"
        src={src}
        title={title}
        allow={VIDEO_EMBED_ALLOW}
        allowFullScreen
      />
    );

  return (
    <div
      className={clsx(videoEmbedStyles({ playing: playing && !lightbox }), className)}
      style={boxStyle}
      {...props}
    >
      {playing && !lightbox ? (
        player
      ) : (
        <button
          type="button"
          className="video-embed__poster"
          aria-label={playLabel ?? `Play ${title}`}
          aria-haspopup={lightbox ? "dialog" : undefined}
          onClick={() => (lightbox ? setOpen(true) : setPlaying(true))}
        >
          {poster && <img className="video-embed__image" src={poster} alt="" />}
          <span className="video-embed__play" aria-hidden="true" />
        </button>
      )}
      {lightbox && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent size="fullscreen">
            <DialogTitle className="video-embed__sr">{title}</DialogTitle>
            {open && <div className="video-embed__frame">{player}</div>}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
