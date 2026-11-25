import { VideoEmbed } from "@ui-organized/react";
import type { UsageExampleSet } from "./types";

/** A drawn poster, so the examples need no image file. */
const POSTER =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2b2f36"/><stop offset="1" stop-color="#5a4b3c"/></linearGradient></defs><rect width="1600" height="900" fill="url(#g)"/><rect x="160" y="160" width="760" height="56" rx="10" fill="#ffffff" fill-opacity="0.85"/><rect x="160" y="244" width="520" height="28" rx="8" fill="#ffffff" fill-opacity="0.4"/><rect x="160" y="420" width="1280" height="320" rx="16" fill="#ffffff" fill-opacity="0.12"/></svg>`,
  );

const box = { width: "100%", maxWidth: 360 };
const text = { margin: "var(--spacing-space-02) 0 0", color: "var(--color-content-secondary)", fontSize: "var(--type-size-body-small)" };

export const videoEmbedExamples: UsageExampleSet = {
  poster: {
    layout: "padded",
    Do: () => (
      <div style={box}>
        <VideoEmbed src="/media/product-tour.mp4" title="Product tour" poster={POSTER} />
      </div>
    ),
    // A blank box with a play button: nothing says what will play.
    Dont: () => (
      <div style={box}>
        <VideoEmbed src="/media/product-tour.mp4" title="Product tour" />
      </div>
    ),
  },

  background: {
    layout: "padded",
    Do: () => (
      <div style={box}>
        <VideoEmbed src="/media/ambient-loop.mp4" title="Ambient loop" poster={POSTER} background />
        <p style={text}>Every plan includes unlimited projects.</p>
      </div>
    ),
    // The only statement of the offer is inside a decorative loop.
    Dont: () => (
      <div style={box}>
        <VideoEmbed src="/media/offer-announcement.mp4" title="Offer announcement" poster={POSTER} background />
      </div>
    ),
  },
};
