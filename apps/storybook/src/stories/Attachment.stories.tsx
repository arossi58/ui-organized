import type { Meta, StoryObj } from "@storybook/react-vite";
import { Attachment } from "@ui-organized/react";

const meta: Meta<typeof Attachment> = {
  title: "Components/Data Display/Attachment",
  component: Attachment,
  tags: ["!dev"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "A file as a row or a chip: its name and size, a progress bar while it uploads, and its error with a retry once it fails.",
      },
    },
  },
  argTypes: {
    status: { control: "inline-radio", options: ["done", "uploading", "error"] },
    variant: { control: "inline-radio", options: ["row", "chip"] },
    progress: { control: { type: "range", min: 0, max: 100 } },
  },
};

export default meta;
type Story = StoryObj<typeof Attachment>;

const noop = () => {};

export const Inspect: Story = {
  tags: ["dev"],
  args: { name: "quarterly-report.pdf", size: 482100, status: "done", variant: "row", onRemove: noop },
  render: (args) => (
    <div style={{ maxWidth: 420 }}>
      <Attachment {...args} />
    </div>
  ),
};

/** Done, uploading and failed, as rows. */
export const States: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<Attachment name="quarterly-report.pdf" size={482100} onRemove={remove} />
<Attachment name="site-walkthrough.mov" status="uploading" progress={45} onRemove={cancel} />
<Attachment name="floor-plan.png" status="error" error="The connection dropped." onRetry={retry} onRemove={remove} />
`.trim(),
      },
    },
  },
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxWidth: 420 }}>
      <Attachment name="quarterly-report.pdf" size={482100} onRemove={noop} />
      <Attachment name="site-walkthrough.mov" status="uploading" progress={45} onRemove={noop} />
      <Attachment name="floor-plan.png" status="error" error="The connection dropped." onRetry={noop} onRemove={noop} />
    </div>
  ),
};

/** `href` makes the name a download link. */
export const Downloadable: Story = {
  render: () => (
    <div style={{ maxWidth: 420 }}>
      <Attachment name="quarterly-report.pdf" size={482100} href="#quarterly-report.pdf" />
    </div>
  ),
};

/** Chips, for files attached to a message. */
export const Chips: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", maxWidth: 480 }}>
      <Attachment variant="chip" name="notes.txt" size={2048} onRemove={noop} />
      <Attachment variant="chip" name="diagram.png" status="uploading" progress={60} onRemove={noop} />
      <Attachment variant="chip" name="data.csv" status="error" onRemove={noop} />
    </div>
  ),
};
