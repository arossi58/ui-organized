import type { Meta, StoryObj } from "@storybook/react-vite";
import { Tag } from "@ui-organized/react";

const VARIANTS = ["success", "info", "info-secondary", "caution", "warning", "error"] as const;
const SIZES = ["sm", "md", "lg"] as const;

const meta: Meta<typeof Tag> = {
  title: "Components/Data Display/Tag",
  component: Tag,
  tags: ["!dev"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Tags label and categorize content. Use `variant` to convey status (success, info, info-secondary, caution, warning, error), `size` for density, and `emphasized` to toggle between a solid and subdued style. Pass `icon` (with optional `iconPosition`) to render a leading or trailing icon — 16px across every size, set `spacing-01` from the label.",
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
    icon: {
      control: "select",
      options: [undefined, "check-circle", "info", "clock", "alert-triangle", "close"],
    },
    iconPosition: {
      control: "inline-radio",
      options: ["left", "right"],
    },
    children: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof Tag>;

export const Inspect: Story = {
  tags: ["dev"],
  args: {
    children: "Status",
    variant: "success",
    size: "md",
    emphasized: true,
    icon: "check-circle",
    iconPosition: "left",
  },
};

export const WithIcons: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<Tag variant="success" icon="check-circle">Complete</Tag>
<Tag variant="info" icon="info">Info</Tag>
<Tag variant="caution" icon="clock">Pending</Tag>
<Tag variant="error" icon="alert-triangle">Failed</Tag>

{/* Trailing icon (e.g. a removable tag) */}
<Tag variant="info" emphasized={false} icon="close" iconPosition="right">Dismiss</Tag>
`.trim(),
      },
    },
  },
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
        <Tag variant="success" icon="check-circle">Complete</Tag>
        <Tag variant="info" icon="info">Info</Tag>
        <Tag variant="caution" icon="clock">Pending</Tag>
        <Tag variant="error" icon="alert-triangle">Failed</Tag>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
        <Tag variant="success" emphasized={false} icon="check-circle">Complete</Tag>
        <Tag variant="info" emphasized={false} icon="info">Info</Tag>
        <Tag variant="caution" emphasized={false} icon="clock">Pending</Tag>
        <Tag variant="info" emphasized={false} icon="close" iconPosition="right">Dismiss</Tag>
      </div>
    </div>
  ),
};

export const IconSizes: Story = {
  parameters: {
    docs: {
      description: {
        story: "Icons render at 16px across every tag size.",
      },
      source: {
        code: `
<Tag variant="info" size="sm" icon="clock">sm</Tag>
<Tag variant="info" size="md" icon="clock">md</Tag>
<Tag variant="info" size="lg" icon="clock">lg</Tag>
`.trim(),
      },
    },
  },
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
      {SIZES.map((size) => (
        <Tag key={size} variant="info" size={size} icon="clock">
          {size}
        </Tag>
      ))}
    </div>
  ),
};

export const Emphasized: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<Tag variant="success" emphasized>success</Tag>
<Tag variant="info" emphasized>info</Tag>
<Tag variant="info-secondary" emphasized>info-secondary</Tag>
<Tag variant="caution" emphasized>caution</Tag>
<Tag variant="warning" emphasized>warning</Tag>
<Tag variant="error" emphasized>error</Tag>
`.trim(),
      },
    },
  },
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
      {VARIANTS.map((variant) => (
        <Tag key={variant} variant={variant} emphasized>
          {variant}
        </Tag>
      ))}
    </div>
  ),
};

export const Subdued: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<Tag variant="success" emphasized={false}>success</Tag>
<Tag variant="info" emphasized={false}>info</Tag>
<Tag variant="info-secondary" emphasized={false}>info-secondary</Tag>
<Tag variant="caution" emphasized={false}>caution</Tag>
<Tag variant="warning" emphasized={false}>warning</Tag>
<Tag variant="error" emphasized={false}>error</Tag>
`.trim(),
      },
    },
  },
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
      {VARIANTS.map((variant) => (
        <Tag key={variant} variant={variant} emphasized={false}>
          {variant}
        </Tag>
      ))}
    </div>
  ),
};

export const AllSizes: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<Tag variant="success" size="sm">sm</Tag>
<Tag variant="success" size="md">md</Tag>
<Tag variant="success" size="lg">lg</Tag>
`.trim(),
      },
    },
  },
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      {SIZES.map((size) => (
        <Tag key={size} variant="success" size={size}>
          {size}
        </Tag>
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
      <Tag key={variant} variant={variant} size={size} emphasized>
        {variant}
      </Tag>
    ))}
    {VARIANTS.map((variant) => (
      <Tag key={variant} variant={variant} size={size} emphasized={false}>
        {variant}
      </Tag>
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
              <Tag key={variant} variant={variant} size={size} emphasized>
                {variant}
              </Tag>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            {VARIANTS.map((variant) => (
              <Tag key={variant} variant={variant} size={size} emphasized={false}>
                {variant}
              </Tag>
            ))}
          </div>
        </div>
      ))}
    </div>
  ),
};
