import { FileUpload, Input } from "@ui-organized/react";
import type { UsageExampleSet } from "./types";

const stack = {
  display: "flex",
  flexDirection: "column" as const,
  gap: "var(--spacing-space-03)",
  width: "100%",
};

const UPLOADS = [
  new File([new Uint8Array(1_200_000)], "walkthrough.mov", { type: "video/quicktime" }),
  new File([new Uint8Array(300_000)], "plan.png", { type: "application/octet-stream" }),
];

export const fileUploadExamples: UsageExampleSet = {
  constraints: {
    layout: "padded",
    Do: () => (
      <FileUpload
        label="Profile photo"
        triggerLabel="Choose file"
        helperText="PNG or JPG, up to 5 MB."
        size="sm"
      />
    ),
    // The reader learns the rules only after breaking one, and still not which.
    Dont: () => (
      <FileUpload label="Profile photo" triggerLabel="Choose file" error="Invalid file." size="sm" />
    ),
  },

  labelled: {
    layout: "padded",
    Do: () => <FileUpload label="Signed agreement" variant="compact" size="sm" />,
    // Nothing says which file belongs here.
    Dont: () => <FileUpload variant="compact" size="sm" />,
  },

  compact: {
    layout: "padded",
    Do: () => (
      <div style={stack}>
        <Input label="Title" placeholder="Quarterly summary" size="sm" />
        <FileUpload label="Attachment" variant="compact" size="sm" />
      </div>
    ),
    // A full drop target dwarfs the field beside it and takes over the form.
    Dont: () => (
      <div style={stack}>
        <Input label="Title" placeholder="Quarterly summary" size="sm" />
        <FileUpload label="Attachment" size="lg" />
      </div>
    ),
  },

  "upload-state": {
    layout: "padded",
    Do: () => (
      <FileUpload
        label="Attachments"
        variant="compact"
        showPreview={false}
        defaultAcceptedFiles={UPLOADS}
        fileStatus={(file) =>
          file.name === "walkthrough.mov" ? { progress: 45 } : file.name === "plan.png" ? { error: "The connection dropped." } : undefined
        }
        onRetry={() => {}}
      />
    ),
    // Every row looks finished, whatever its upload is doing.
    Dont: () => <FileUpload label="Attachments" variant="compact" showPreview={false} defaultAcceptedFiles={UPLOADS} />,
  },
};
