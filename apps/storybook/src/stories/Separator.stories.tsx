import type { Meta, StoryObj } from "@storybook/react-vite";
import { Separator } from "@ui-organized/react";

const meta: Meta<typeof Separator> = {
  title: "Components/Layout/Separator",
  component: Separator,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "A thin rule that separates content. Use `orientation` for horizontal or vertical, and `spacing` to control the surrounding margin.",
      },
    },
  },
  argTypes: {
    orientation: { control: "inline-radio", options: ["horizontal", "vertical"] },
    spacing: { control: "select", options: ["none", "sm", "md", "lg"] },
  },
};

export default meta;
type Story = StoryObj<typeof Separator>;

export const Horizontal: Story = {
  render: (args) => (
    <div style={{ maxWidth: 360, color: "var(--color-text-text-secondary)" }}>
      <p style={{ margin: 0 }}>Section one</p>
      <Separator {...args} />
      <p style={{ margin: 0 }}>Section two</p>
    </div>
  ),
  args: { orientation: "horizontal", spacing: "md" },
};

export const Vertical: Story = {
  render: () => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        height: 24,
        color: "var(--color-text-text-secondary)",
      }}
    >
      <span>Home</span>
      <Separator orientation="vertical" spacing="md" />
      <span>Docs</span>
      <Separator orientation="vertical" spacing="md" />
      <span>Pricing</span>
    </div>
  ),
};
