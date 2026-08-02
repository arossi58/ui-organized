import type { Meta, StoryObj } from "@storybook/react-vite";
import { FileUpload } from "@ui-organized/react";

/**
 * Files built in memory, never fetched.
 *
 * `File` is constructible in the browser, so a story can show the populated
 * list without a picker interaction — and without the network race that a
 * remote fixture would introduce into the visual suite.
 */
const SAMPLE_FILES = [
  new File(["# Notes\n"], "release-notes.md", { type: "text/markdown" }),
  new File([new Uint8Array(48_000)], "contract.pdf", { type: "application/pdf" }),
];

const meta: Meta<typeof FileUpload> = {
  title: "Components/Forms/FileUpload",
  component: FileUpload,
  tags: ["!dev"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "A drop target, a browse button and a list of chosen files. `accept`, `maxFiles` and `maxFileSize` are enforced by the machine, which sorts each file into accepted or rejected — `onFileReject` tells you which failed and why.\n\nThe dropzone deliberately does not reuse `.field__control`: that is a fixed-height single-line box, and this grows a row per file.",
      },
    },
  },
  argTypes: {
    size: { control: "select", options: ["sm", "md", "lg"] },
    variant: { control: "select", options: ["dropzone", "button", "compact"] },
    maxFiles: { control: { type: "number" } },
  },
};

export default meta;
type Story = StoryObj<typeof FileUpload>;

export const Inspect: Story = {
  tags: ["dev"],
  args: {
    label: "Attachments",
    maxFiles: 5,
    defaultAcceptedFiles: SAMPLE_FILES,
    size: "md",
    variant: "dropzone",
  },
};

export const Empty: Story = {
  render: () => (
    <FileUpload
      label="Attachments"
      helperText="PDF or Markdown, up to 5 MB each."
      accept={["application/pdf", ".md"]}
      maxFileSize={5 * 1024 * 1024}
      maxFiles={5}
    />
  ),
  parameters: {
    docs: {
      source: {
        code: `<FileUpload
  label="Attachments"
  helperText="PDF or Markdown, up to 5 MB each."
  accept={["application/pdf", ".md"]}
  maxFileSize={5 * 1024 * 1024}
  maxFiles={5}
/>`,
      },
    },
  },
};

export const ButtonOnly: Story = {
  render: () => (
    <FileUpload variant="button" triggerLabel="Attach a file" maxFiles={1} />
  ),
  parameters: {
    docs: {
      source: {
        code: `<FileUpload variant="button" triggerLabel="Attach a file" maxFiles={1} />`,
      },
    },
  },
};

export const Compact: Story = {
  render: () => (
    <FileUpload
      label="Logo"
      variant="compact"
      accept="image/*"
      maxFiles={1}
      dropzoneLabel="Drop an image, or"
    />
  ),
  parameters: {
    docs: {
      source: {
        code: `<FileUpload
  label="Logo"
  variant="compact"
  accept="image/*"
  maxFiles={1}
  dropzoneLabel="Drop an image, or"
/>`,
      },
    },
  },
};

export const Invalid: Story = {
  render: () => (
    <FileUpload
      label="Attachments"
      defaultAcceptedFiles={SAMPLE_FILES}
      error="One of those files is larger than the 5 MB limit."
    />
  ),
  parameters: {
    docs: {
      source: {
        code: `<FileUpload
  label="Attachments"
  error="One of those files is larger than the 5 MB limit."
/>`,
      },
    },
  },
};
