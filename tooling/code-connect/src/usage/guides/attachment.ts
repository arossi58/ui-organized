import type { UsageGuide } from "../types.js";

export const attachmentUsage: UsageGuide = {
  slug: "attachment",
  codeName: "Attachment",
  summary:
    "A file shown by its name and size, with a progress bar while it uploads and its error with a retry if it fails. Rows suit a list of uploads; chips suit files attached to a message.",
  useWhen: [
    "A file the reader added needs to be seen, removed or retried.",
    "Files sit beside a message or a comment, as chips.",
    "A list of finished files should be downloadable, through `href`.",
  ],
  avoid: [
    {
      text: "For choosing files, which a drop target and a picker do.",
      instead: ["file-upload"],
    },
    {
      text: "For a gallery of images, where the picture is the content.",
    },
  ],
  guidance: [
    {
      do: "Say what failed in `error`, in words the reader can act on, and offer a retry.",
      dont: "Show a red row with Upload failed and nothing to do about it.",
      example: "errors",
    },
    {
      do: "Use the chip for files that travel with a message, and the row for a list of uploads.",
      dont: "Use rows inside a message, where they crowd out the text they belong to.",
      example: "variants",
    },
  ],
  accessibility: [
    "The progress bar is named for the file, so a screen reader hears which upload it measures.",
    "Remove and retry are named for the file too, so a list of them reads as distinct buttons.",
    "Status changes are not announced on their own; announce a finished batch from the page.",
  ],
  content: [
    "Keep the file's own name; do not rewrite it into a description.",
    "Write errors as what happened and what to do: The connection dropped. Try again.",
  ],
  related: [
    { slug: "file-upload", when: "the reader is choosing the files." },
    { slug: "progress", when: "one task's progress is shown on its own." },
  ],
};
