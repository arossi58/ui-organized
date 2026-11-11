import type { UsageGuide } from "../types.js";

export const signaturePadUsage: UsageGuide = {
  slug: "signature-pad",
  codeName: "SignaturePad",
  summary:
    "A surface for drawing a signature or a quick mark by hand, recorded as strokes. It captures a personal mark of agreement where a typed name or a ticked box would not carry the same weight.",
  useWhen: [
    "A handwritten mark is expected as evidence of agreement or receipt.",
    "The reader is likely on a touch screen, or has a pen or pointer to hand.",
    "The drawn mark itself needs keeping, not only the fact that someone agreed.",
  ],
  avoid: [
    {
      text: "For plain consent, where ticking a box is quicker and works for everyone.",
      instead: ["checkbox"],
    },
    {
      text: "As the only way to sign, which shuts out anyone who cannot draw with a pointer.",
      instead: ["input"],
    },
    {
      text: "For a signature the reader already has as an image.",
      instead: ["file-upload"],
    },
  ],
  guidance: [
    {
      do: "Keep the guide on, so the reader knows where to sign and how large.",
      dont: "Hide the guide, so marks land squeezed into a corner or run off the edge.",
      example: "guide",
    },
    {
      do: "Say what signing means in the label or helper text, right beside the pad.",
      dont: "Label it Signature and leave the reader to guess what they are agreeing to.",
      example: "stated-purpose",
    },
    {
      do: "Keep the clear button, so a slipped stroke can be redrawn from scratch.",
      dont: "Turn off `showClear`, so one stray stroke is permanent unless the page is reloaded.",
    },
  ],
  accessibility: [
    "Drawing needs a pointer, so always offer a keyboard path, such as typing a full name, alongside the pad.",
    "The clear control is a real button that announces its text, so keep `clearLabel` a plain verb.",
    "Nothing can describe the drawn mark, so confirm in text that a signature was captured.",
  ],
  content: [
    "Write the helper text as what the mark means: By signing, you accept the terms above.",
    "Keep the clear label to a verb, such as Clear or Start again.",
  ],
  related: [
    { slug: "checkbox", when: "agreement only needs recording, not a drawn mark." },
    { slug: "file-upload", when: "the reader already has their signature as an image." },
  ],
};
