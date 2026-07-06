import type { Meta, StoryObj } from "@storybook/react-vite";
import { Divider } from "@ui-organized/react";

const meta: Meta<typeof Divider> = {
  title: "Components/Layout/Divider",
  component: Divider,
  tags: ["!dev"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "A thin visual rule for separating content or controls. Use `orientation` for horizontal or vertical, and `spacing` to control the surrounding margin. A vertical divider stretches to the height of its flex row.",
      },
    },
  },
  argTypes: {
    orientation: { control: "inline-radio", options: ["horizontal", "vertical"] },
    spacing: { control: "select", options: ["none", "sm", "md", "lg"] },
  },
};

export default meta;
type Story = StoryObj<typeof Divider>;

export const Inspect: Story = {
  tags: ["dev"],
  render: (args) => (
    <div style={{ maxWidth: 360, color: "var(--color-text-secondary)" }}>
      <p style={{ margin: 0 }}>Section one</p>
      <Divider {...args} />
      <p style={{ margin: 0 }}>Section two</p>
    </div>
  ),
  args: { orientation: "horizontal", spacing: "md" },
};

export const Horizontal: Story = {
  render: () => (
    <div style={{ maxWidth: 360, color: "var(--color-text-secondary)" }}>
      <p style={{ margin: 0 }}>Section one</p>
      <Divider orientation="horizontal" spacing="md" />
      <p style={{ margin: 0 }}>Section two</p>
    </div>
  ),
};

export const Vertical: Story = {
  render: () => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        height: 24,
        color: "var(--color-text-secondary)",
      }}
    >
      <span>Home</span>
      <Divider orientation="vertical" spacing="md" />
      <span>Docs</span>
      <Divider orientation="vertical" spacing="md" />
      <span>Pricing</span>
    </div>
  ),
};
