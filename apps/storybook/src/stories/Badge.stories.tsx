import type { Meta, StoryObj } from "@storybook/react-vite";
import { Badge } from "@ui-organized/react";

const VARIANTS = ["success", "info", "info-secondary", "caution", "warning", "error"] as const;
const SIZES = ["sm", "md", "lg"] as const;

const meta: Meta<typeof Badge> = {
  title: "Components/Data Display/Badge",
  component: Badge,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Badges label and categorize content. Use `variant` to convey status (success, info, info-secondary, caution, warning, error), `size` for density, and `emphasized` to toggle between a solid and subdued style.",
      },
    },
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
  parameters: {
    docs: {
      source: {
        code: `
<Badge variant="success" emphasized>success</Badge>
<Badge variant="info" emphasized>info</Badge>
<Badge variant="info-secondary" emphasized>info-secondary</Badge>
<Badge variant="caution" emphasized>caution</Badge>
<Badge variant="warning" emphasized>warning</Badge>
<Badge variant="error" emphasized>error</Badge>
`.trim(),
      },
    },
  },
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
  parameters: {
    docs: {
      source: {
        code: `
<Badge variant="success" emphasized={false}>success</Badge>
<Badge variant="info" emphasized={false}>info</Badge>
<Badge variant="info-secondary" emphasized={false}>info-secondary</Badge>
<Badge variant="caution" emphasized={false}>caution</Badge>
<Badge variant="warning" emphasized={false}>warning</Badge>
<Badge variant="error" emphasized={false}>error</Badge>
`.trim(),
      },
    },
  },
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
  parameters: {
    docs: {
      source: {
        code: `
<Badge variant="success" size="sm">sm</Badge>
<Badge variant="success" size="md">md</Badge>
<Badge variant="success" size="lg">lg</Badge>
`.trim(),
      },
    },
  },
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
  parameters: {
    docs: {
      source: {
        code: `
{SIZES.map((size) => (
  <React.Fragment key={size}>
    {VARIANTS.map((variant) => (
      <Badge key={variant} variant={variant} size={size} emphasized>
        {variant}
      </Badge>
    ))}
    {VARIANTS.map((variant) => (
      <Badge key={variant} variant={variant} size={size} emphasized={false}>
        {variant}
      </Badge>
    ))}
  </React.Fragment>
))}
`.trim(),
      },
    },
  },
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
