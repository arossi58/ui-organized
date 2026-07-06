import type { Meta, StoryObj } from "@storybook/react-vite";
import { Skeleton } from "@ui-organized/react";

const meta: Meta<typeof Skeleton> = {
  title: "Components/Feedback/Skeleton",
  component: Skeleton,
  tags: ["!dev"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "A shimmering placeholder sized to the eventual content. Use `variant` for shape, `width`/`height` for size, and `lines` for multi-line text.",
      },
    },
  },
  argTypes: {
    variant: { control: "select", options: ["text", "circle", "rect", "rounded"] },
    animated: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof Skeleton>;

export const Inspect: Story = {
  tags: ["dev"],
  render: (args) => <Skeleton {...args} width={280} />,
  args: { variant: "text", animated: true },
};

export const MultilineText: Story = {
  render: () => <Skeleton variant="text" lines={4} width={320} />,
};

export const Shapes: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
      <Skeleton variant="circle" width={48} height={48} />
      <Skeleton variant="rounded" width={120} height={48} />
      <Skeleton variant="rect" width={120} height={48} />
    </div>
  ),
};

export const CardPlaceholder: Story = {
  render: () => (
    <div
      style={{
        display: "flex",
        gap: 12,
        width: 320,
        padding: 16,
        border: "1px solid var(--color-border-secondary)",
        borderRadius: "var(--radius-interactive)",
      }}
    >
      <Skeleton variant="circle" width={40} height={40} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
        <Skeleton variant="text" width="60%" />
        <Skeleton variant="text" lines={2} />
      </div>
    </div>
  ),
};
