import type { Meta, StoryObj } from "@storybook/react-vite";
import { Meter } from "@ui-organized/react";

const meta: Meta<typeof Meter> = {
  title: "Components/Feedback/Meter",
  component: Meter,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Shows a static measured value within a known range (disk usage, score) — distinct from Progress, which tracks task completion. `value` is required.",
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
type Story = StoryObj<typeof Meter>;

export const Default: Story = {
  render: (args) => (
    <div style={{ width: 320 }}>
      <Meter {...args} />
    </div>
  ),
  args: { value: 64, variant: "default", size: "md" },
};

export const WithLabel: Story = {
  render: () => (
    <div style={{ width: 320 }}>
      <Meter value={0.72} min={0} max={1} label="Storage used" showValue format={{ style: "percent" }} />
    </div>
  ),
};

export const Variants: Story = {
  render: () => (
    <div style={{ width: 320, display: "flex", flexDirection: "column", gap: 16 }}>
      <Meter value={30} variant="default" label="Default" showValue />
      <Meter value={90} variant="success" label="Healthy" showValue />
      <Meter value={75} variant="warning" label="Warning" showValue />
      <Meter value={95} variant="error" label="Critical" showValue />
    </div>
  ),
};
