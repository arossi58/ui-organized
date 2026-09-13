import type { Meta, StoryObj } from "@storybook/react-vite";
import { Progress } from "@ui-organized/react";

const meta: Meta<typeof Progress> = {
  title: "Components/Feedback/Progress",
  component: Progress,
  tags: ["!dev"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "A progress bar or ring. Pass `value` (or `null` for indeterminate), and use `variant`, `size`, `label`, and `showValue`. `shape=\"circular\"` draws the same value as a ring — identical states and colours, for places a full-width bar doesn't fit. Use `Meter` instead for a static measurement that isn't tracking a task.",
      },
    },
  },
  argTypes: {
    variant: { control: "select", options: ["default", "success", "warning", "error"] },
    size: { control: "select", options: ["sm", "md", "lg"] },
    shape: { control: "select", options: ["linear", "circular"] },
    value: { control: { type: "range", min: 0, max: 100 } },
  },
};

export default meta;
type Story = StoryObj<typeof Progress>;

export const Inspect: Story = {
  tags: ["dev"],
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

export const Circular: Story = {
  render: () => <Progress shape="circular" value={68} showValue />,
  parameters: {
    docs: {
      source: { code: `<Progress shape="circular" value={68} showValue />` },
    },
  },
};

export const CircularSizes: Story = {
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
      <Progress shape="circular" size="sm" value={68} />
      <Progress shape="circular" size="md" value={68} showValue />
      <Progress shape="circular" size="lg" value={68} showValue />
    </div>
  ),
  parameters: {
    docs: {
      source: {
        code: `<Progress shape="circular" size="sm" value={68} />
<Progress shape="circular" size="md" value={68} showValue />
<Progress shape="circular" size="lg" value={68} showValue />`,
      },
    },
  },
};

export const CircularVariants: Story = {
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
      <Progress shape="circular" value={30} showValue />
      <Progress shape="circular" variant="success" value={100} showValue />
      <Progress shape="circular" variant="warning" value={75} showValue />
      <Progress shape="circular" variant="error" value={12} showValue />
    </div>
  ),
  parameters: {
    docs: {
      source: {
        code: `<Progress shape="circular" value={30} showValue />
<Progress shape="circular" variant="success" value={100} showValue />
<Progress shape="circular" variant="warning" value={75} showValue />
<Progress shape="circular" variant="error" value={12} showValue />`,
      },
    },
  },
};
