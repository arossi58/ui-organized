import type { Meta, StoryObj } from "@storybook/react-vite";
import { Progress } from "@ui-organized/react";

const meta: Meta<typeof Progress> = {
  title: "Components/Feedback/Progress",
  component: Progress,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "A horizontal progress bar. Pass `value` (or `null` for indeterminate), and use `variant`, `size`, `label`, and `showValue`.",
      },
    },
  },
  argTypes: {
    variant: { control: "select", options: ["default", "success", "warning", "error"] },
    size: { control: "select", options: ["sm", "md", "lg"] },
    value: { control: { type: "range", min: 0, max: 100 } },
  },
};

export default meta;
type Story = StoryObj<typeof Progress>;

export const Default: Story = {
  render: (args) => (
    <div style={{ width: 320 }}>
      <Progress {...args} />
    </div>
  ),
  args: { value: 60, variant: "default", size: "md" },
};

export const WithLabel: Story = {
  render: () => (
    <div style={{ width: 320 }}>
      <Progress value={72} label="Uploading…" showValue />
    </div>
  ),
};

export const Variants: Story = {
  render: () => (
    <div style={{ width: 320, display: "flex", flexDirection: "column", gap: 16 }}>
      <Progress value={40} variant="default" />
      <Progress value={100} variant="success" />
      <Progress value={80} variant="warning" />
      <Progress value={25} variant="error" />
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ width: 320, display: "flex", flexDirection: "column", gap: 16 }}>
      <Progress value={60} size="sm" />
      <Progress value={60} size="md" />
      <Progress value={60} size="lg" />
    </div>
  ),
};

export const Indeterminate: Story = {
  render: () => (
    <div style={{ width: 320 }}>
      <Progress value={null} label="Working…" />
    </div>
  ),
};
