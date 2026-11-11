import type { UsageGuide } from "../types.js";

export const fileUploadUsage: UsageGuide = {
  slug: "file-upload",
  codeName: "FileUpload",
  summary:
    "A form field for attaching files from the reader's device, by dropping them on a target or browsing for them. It lists what was chosen so the reader can check and remove files before submitting.",
  useWhen: [
    "The form needs a document, image or other file the reader already has.",
    "The reader may attach several files and needs to see and prune the list.",
    "Dragging files in is a natural shortcut, alongside a button for everyone else.",
  ],
  avoid: [
    {
      text: "For content the reader would rather type or paste as text.",
      instead: ["text-area", "input"],
    },
    {
      text: "For cropping or adjusting an image once it is chosen, which is a separate step.",
      instead: ["image-cropper"],
    },
    {
      text: "For capturing a drawn mark rather than an existing file.",
      instead: ["signature-pad"],
    },
  ],
  guidance: [
    {
      do: "State the accepted types and size limit in `helperText` before anyone picks a file.",
      dont: "Reveal the limits only in an error after a file has already been rejected.",
      example: "constraints",
    },
    {
      do: "Give the field a `label` naming what to attach, like any other form field.",
      dont: "Rely on the drop target's instructions to say what the field is for.",
      example: "labelled",
    },
    {
      do: "Use `compact` where the upload is one field among many.",
      dont: "Put a full dropzone in a dense form, where it outweighs every other field.",
      example: "compact",
    },
    {
      do: "Explain a rejected file in the error, naming the file and the rule it broke.",
      dont: "Drop a rejected file silently, so the reader thinks it was attached.",
    },
  ],
  accessibility: [
    "The browse button is the keyboard path; the drop target itself is not a separate control.",
    "Each chosen file has a remove button named after that file, so the list is navigable.",
    "Dragging is never the only way in, so keep the trigger label clear about what it opens.",
  ],
  content: [
    "Name the file, not the mechanism: Profile photo, not Upload.",
    "Match the trigger to the count: Choose file for one, Choose files for several.",
    "Write limits the way people read them, such as PNG or JPG, up to 5 MB.",
  ],
  related: [
    { slug: "image-cropper", when: "the chosen image has to be framed before it is used." },
  ],
};
