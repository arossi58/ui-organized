import type { Meta, StoryObj } from "@storybook/react";
import { Badge } from "@ds/react";

const meta: Meta<typeof Badge> = {
  title: "Components/Badge",
  component: Badge,
  parameters: {
    layout: "padded",
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "success", "warning", "error", "info"],
    },
    size: {
      control: "select",
      options: ["sm", "md"],
    },
    children: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Default: Story = {
  args: {
    children: "Badge",
    variant: "default",
    size: "md",
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
      <Badge variant="default">Default</Badge>
      <Badge variant="info">Info</Badge>
      <Badge variant="success">Success</Badge>
      <Badge variant="warning">Warning</Badge>
      <Badge variant="error">Error</Badge>
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <Badge size="sm">Small</Badge>
      <Badge size="md">Medium</Badge>
    </div>
  ),
};

export const AllVariantsAndSizes: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {(["default", "info", "success", "warning", "error"] as const).map((variant) => (
        <div key={variant} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Badge variant={variant} size="sm">{variant}</Badge>
          <Badge variant={variant} size="md">{variant}</Badge>
        </div>
      ))}
    </div>
  ),
};
