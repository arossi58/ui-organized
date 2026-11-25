import type { UsageGuide } from "../types.js";

export const videoEmbedUsage: UsageGuide = {
  slug: "video-embed",
  codeName: "VideoEmbed",
  summary:
    "A video that waits behind its poster until the reader asks for it. Nothing loads until play is pressed, which keeps heavy players off the page, and the box holds its shape so the layout never jumps.",
  useWhen: [
    "A page shows a demo, a talk or a walkthrough that some readers will want and others will skip.",
    "The player is an embedded page that should not load with yours.",
    "A hero needs moving imagery behind its content, with `background`.",
  ],
  avoid: [
    {
      text: "For a short animation that explains an interface, where an image or CSS is lighter.",
    },
    {
      text: "For several clips in one slot, where the reader needs to move between them.",
      instead: ["carousel"],
    },
    {
      text: "To start sound on its own, which takes control away from the reader.",
    },
  ],
  guidance: [
    {
      do: "Give every video a `poster` that shows what it is, so the frame earns the click.",
      dont: "Leave a blank box with a play button, which says nothing about what will play.",
      example: "poster",
    },
    {
      do: "Use `background` only for decoration, with the same message said in text beside it.",
      dont: "Put information in a background loop, which is hidden from screen readers and still under reduced motion.",
      example: "background",
    },
    {
      do: "Use `lightbox` when the video deserves more room than its slot, such as a demo in a card.",
      dont: "Play a wide recording in a narrow column, where its detail is too small to follow.",
    },
  ],
  accessibility: [
    "The play button is named Play followed by the title, so the title has to say what the video is.",
    "Provide `captions` for any video with speech; an embedded player carries its own.",
    "A background video is hidden from assistive tech and stays on its first frame under reduced motion.",
  ],
  content: [
    "Title the video by its subject, not its format: Product tour, not Video.",
    "Say how long it runs in the text beside it when it is longer than a minute.",
  ],
  related: [
    { slug: "dialog", when: "the video is one part of a larger task in an overlay." },
    { slug: "carousel", when: "several pieces of media share one slot." },
  ],
};
