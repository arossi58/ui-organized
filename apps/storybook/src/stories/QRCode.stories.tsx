import type { Meta, StoryObj } from "@storybook/react-vite";
import { Icon, QRCode } from "@ui-organized/react";

const meta: Meta<typeof QRCode> = {
  title: "Components/Data Display/QRCode",
  component: QRCode,
  tags: ["!dev"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          'A scannable code for a string. `pixelSize` is the edge of one module and must stay an integer — a fractional module produces moiré and can make the code unreadable, which is why the size steps divide cleanly rather than coming from the spacing scale. An `overlay` covers part of the pattern, so pair it with `errorCorrection="H"`.',
      },
    },
  },
  argTypes: {
    size: { control: "select", options: ["sm", "md", "lg"] },
    variant: { control: "select", options: ["default", "framed"] },
    errorCorrection: { control: "select", options: ["L", "M", "Q", "H"] },
  },
};

export default meta;
type Story = StoryObj<typeof QRCode>;

export const Inspect: Story = {
  tags: ["dev"],
  args: {
    value: "https://uiorganized.com",
    size: "md",
    variant: "default",
  },
};

export const Framed: Story = {
  render: () => <QRCode value="https://uiorganized.com/docs" variant="framed" />,
  parameters: {
    docs: {
      source: { code: `<QRCode value="https://uiorganized.com/docs" variant="framed" />` },
    },
  },
};

export const WithOverlay: Story = {
  render: () => (
    <QRCode
      value="https://uiorganized.com"
      variant="framed"
      errorCorrection="H"
      overlay={<Icon name="star" size={24} />}
    />
  ),
  parameters: {
    docs: {
      source: {
        code: `{/* An overlay covers modules, so raise error correction to compensate. */}
<QRCode
  value="https://uiorganized.com"
  variant="framed"
  errorCorrection="H"
  overlay={<Icon name="star" size={24} />}
/>`,
      },
    },
  },
};

export const WithDownload: Story = {
  render: () => (
    <QRCode value="https://uiorganized.com" showDownload downloadFileName="ui-organized" />
  ),
  parameters: {
    docs: {
      source: {
        code: `<QRCode value="https://uiorganized.com" showDownload downloadFileName="ui-organized" />`,
      },
    },
  },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 24 }}>
      <QRCode value="https://uiorganized.com" size="sm" />
      <QRCode value="https://uiorganized.com" size="md" />
      <QRCode value="https://uiorganized.com" size="lg" />
    </div>
  ),
  parameters: {
    docs: {
      source: {
        code: `<QRCode value="https://uiorganized.com" size="sm" />
<QRCode value="https://uiorganized.com" size="md" />
<QRCode value="https://uiorganized.com" size="lg" />`,
      },
    },
  },
};
