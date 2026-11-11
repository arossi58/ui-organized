import { ImageCropper } from "@ui-organized/react";
import type { UsageExampleSet } from "./types";

/* An inline SVG rather than a network image, so both halves render instantly
   and identically. */
const SAMPLE =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="420">
       <defs>
         <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
           <stop offset="0%" stop-color="#2563eb"/>
           <stop offset="50%" stop-color="#7c3aed"/>
           <stop offset="100%" stop-color="#dc2626"/>
         </linearGradient>
       </defs>
       <rect width="640" height="420" fill="url(#g)"/>
       <circle cx="320" cy="190" r="90" fill="#ffffff" fill-opacity="0.35"/>
     </svg>`,
  );

const frame = { width: "100%" };

export const imageCropperExamples: UsageExampleSet = {
  "match-shape": {
    layout: "padded",
    Do: () => (
      <div style={frame}>
        <ImageCropper
          src={SAMPLE}
          alt="Abstract gradient"
          label="Profile picture"
          size="sm"
          cropShape="circle"
          aspectRatio={1}
        />
      </div>
    ),
    // A free rectangle for a round avatar: the corners the reader framed get cut off later.
    Dont: () => (
      <div style={frame}>
        <ImageCropper src={SAMPLE} alt="Abstract gradient" label="Profile picture" size="sm" />
      </div>
    ),
  },

  "lock-ratio": {
    layout: "padded",
    Do: () => (
      <div style={frame}>
        <ImageCropper
          src={SAMPLE}
          alt="Abstract gradient"
          label="Cover image"
          size="sm"
          aspectRatio={16 / 9}
        />
      </div>
    ),
    // The box can take any shape, so the wide banner will squash or re-crop the result.
    Dont: () => (
      <div style={frame}>
        <ImageCropper src={SAMPLE} alt="Abstract gradient" label="Cover image" size="sm" />
      </div>
    ),
  },
};
