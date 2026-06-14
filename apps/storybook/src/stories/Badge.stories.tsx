import type { Meta, StoryObj } from "@storybook/react-vite";
import { Badge } from "@ds/react";

const VARIANTS = ["success", "info", "info-secondary", "caution", "warning", "error"] as const;
const SIZES = ["sm", "md", "lg"] as const;

const meta: Meta<typeof Badge> = {
  title: "Components/Badge",
  component: Badge,
  parameters: {
    layout: "padded",
  },
  argTypes: {
    variant: {
      control: "select",
      options: VARIANTS,
    },
    size: {
      control: "select",
      options: SIZES,
    },
    emphasized: { control: "boolean" },
    children: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Default: Story = {
  args: {
    children: "Status",
    variant: "success",
    size: "md",
    emphasized: true,
  },
};

export const Emphasized: Story = {
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
      {VARIANTS.map((variant) => (
        <Badge key={variant} variant={variant} emphasized>
          {variant}
        </Badge>
      ))}
    </div>
  ),
};

export const Subdued: Story = {
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
      {VARIANTS.map((variant) => (
        <Badge key={variant} variant={variant} emphasized={false}>
          {variant}
        </Badge>
      ))}
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      {SIZES.map((size) => (
        <Badge key={size} variant="success" size={size}>
          {size}
        </Badge>
      ))}
    </div>
  ),
};

export const AllVariantsGrid: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {SIZES.map((size) => (
        <div key={size} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            {VARIANTS.map((variant) => (
              <Badge key={variant} variant={variant} size={size} emphasized>
                {variant}
              </Badge>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            {VARIANTS.map((variant) => (
              <Badge key={variant} variant={variant} size={size} emphasized={false}>
                {variant}
              </Badge>
            ))}
          </div>
        </div>
      ))}
    </div>
  ),
};
