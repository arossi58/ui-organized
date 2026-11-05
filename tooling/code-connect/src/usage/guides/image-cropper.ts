import type { UsageGuide } from "../types.js";

export const imageCropperUsage: UsageGuide = {
  slug: "image-cropper",
  codeName: "ImageCropper",
  summary:
    "An editor that frames part of an image by dragging and resizing a box over it. It is for fitting a picture to a fixed shape, like a round profile image or a wide banner, before it is saved.",
  useWhen: [
    "The image will be shown in a fixed shape or ratio, and the reader should choose what fills it.",
    "Automatic centring would cut off the part of the picture that matters.",
    "The reader has just chosen an image and is about to save it.",
  ],
  avoid: [
    {
      text: "For choosing which file to use, which comes before any cropping.",
      instead: ["file-upload"],
    },
    {
      text: "For simply displaying an image, where a cropped preview adds controls nobody needs.",
      instead: ["avatar", "card"],
    },
    {
      text: "As a general photo editor for rotating, filtering or adjusting colour.",
    },
  ],
  guidance: [
    {
      do: "Match `cropShape` and `aspectRatio` to where the image will appear.",
      dont: "Offer a free rectangle for a round avatar, so the saved result differs from what the reader framed.",
      example: "match-shape",
    },
    {
      do: "Lock `aspectRatio` whenever the destination has a fixed frame.",
      dont: "Leave the ratio free and let the layout squash or re-crop whatever the reader chose.",
      example: "lock-ratio",
    },
    {
      do: "Say in `helperText` where the crop will be shown and at what shape.",
      dont: "Leave the reader guessing how the framed area will be used.",
    },
  ],
  accessibility: [
    "The crop box is one tab stop and moves with the arrow keys, so keyboard users can frame an image too.",
    "Give the image meaningful `alt` text, since the viewport is otherwise an unnamed picture.",
    "Pair the cropper with a visible preview or description of the result for anyone who cannot see the box.",
  ],
  content: [
    "Label the cropper by the result: Profile picture, not Crop image.",
  ],
  related: [
    { slug: "file-upload", when: "the reader still has to pick the image." },
    { slug: "avatar", when: "the cropped image only needs displaying." },
  ],
};
