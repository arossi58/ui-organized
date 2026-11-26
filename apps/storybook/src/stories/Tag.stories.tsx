import type { Meta, StoryObj } from "@storybook/react-vite";
import { Tag } from "@ui-organized/react";

const VARIANTS = ["success", "info", "info-secondary", "caution", "error"] as const;
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
          "Tags label and categorize content.",
      },
    },
  },
  argTypes: {
    variant: {
      control: "select",
      options: [...VARIANTS, "brand", "neutral"],
    },
    size: {
      control: "select",
      options: SIZES,
    },
    appearance: { control: "select", options: ["solid", "subtle", "outline"] },
    shape: { control: "select", options: ["square", "pill"] },
    dot: { control: "boolean" },
    icon: {
      control: "select",
      options: [undefined, "circle-check-big", "info", "clock", "triangle-alert", "x"],
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
    appearance: "solid",
    icon: "circle-check-big",
    iconPosition: "left",
  },
};

export const WithIcons: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<Tag variant="success" icon="circle-check-big">Complete</Tag>
<Tag variant="info" icon="info">Info</Tag>
<Tag variant="caution" icon="clock">Pending</Tag>
<Tag variant="error" icon="triangle-alert">Failed</Tag>

{/* Trailing icon (e.g. a removable tag) */}
<Tag variant="info" appearance="subtle" icon="x" iconPosition="right">Dismiss</Tag>
`.trim(),
      },
    },
  },
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
        <Tag variant="success" icon="circle-check-big">Complete</Tag>
        <Tag variant="info" icon="info">Info</Tag>
        <Tag variant="caution" icon="clock">Pending</Tag>
        <Tag variant="error" icon="triangle-alert">Failed</Tag>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
        <Tag variant="success" appearance="subtle" icon="circle-check-big">Complete</Tag>
        <Tag variant="info" appearance="subtle" icon="info">Info</Tag>
        <Tag variant="caution" appearance="subtle" icon="clock">Pending</Tag>
        <Tag variant="info" appearance="subtle" icon="x" iconPosition="right">Dismiss</Tag>
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
<Tag variant="success" appearance="solid">success</Tag>
<Tag variant="info" appearance="solid">info</Tag>
<Tag variant="info-secondary" appearance="solid">info-secondary</Tag>
<Tag variant="caution" appearance="solid">caution</Tag>
<Tag variant="error" appearance="solid">error</Tag>
`.trim(),
      },
    },
  },
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
      {VARIANTS.map((variant) => (
        <Tag key={variant} variant={variant} appearance="solid">
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
<Tag variant="success" appearance="subtle">success</Tag>
<Tag variant="info" appearance="subtle">info</Tag>
<Tag variant="info-secondary" appearance="subtle">info-secondary</Tag>
<Tag variant="caution" appearance="subtle">caution</Tag>
<Tag variant="error" appearance="subtle">error</Tag>
`.trim(),
      },
    },
  },
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
      {VARIANTS.map((variant) => (
        <Tag key={variant} variant={variant} appearance="subtle">
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
      <Tag key={variant} variant={variant} size={size} appearance="solid">
        {variant}
      </Tag>
    ))}
    {VARIANTS.map((variant) => (
      <Tag key={variant} variant={variant} size={size} appearance="subtle">
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
              <Tag key={variant} variant={variant} size={size} appearance="solid">
                {variant}
              </Tag>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            {VARIANTS.map((variant) => (
              <Tag key={variant} variant={variant} size={size} appearance="subtle">
                {variant}
              </Tag>
            ))}
          </div>
        </div>
      ))}
    </div>
  ),
};

const ALL_COLORS = [...VARIANTS, "brand", "neutral"] as const;

/** `brand` follows the theme's primary colour; `neutral` is the content grey. */
export const BrandAndNeutral: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<Tag variant="brand">Brand</Tag>
<Tag variant="brand" appearance="subtle">Brand</Tag>
<Tag variant="neutral">Neutral</Tag>
<Tag variant="neutral" appearance="subtle">Neutral</Tag>
`.trim(),
      },
    },
  },
  render: () => (
    <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
      <Tag variant="brand">Brand</Tag>
      <Tag variant="brand" appearance="subtle">Brand</Tag>
      <Tag variant="neutral">Neutral</Tag>
      <Tag variant="neutral" appearance="subtle">Neutral</Tag>
    </div>
  ),
};

/** Every colour in every appearance: `solid`, `subtle` and `outline`. */
export const Appearances: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {(["solid", "subtle", "outline"] as const).map((appearance) => (
        <div key={appearance} style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
          {ALL_COLORS.map((variant) => (
            <Tag key={variant} variant={variant} appearance={appearance}>
              {variant}
            </Tag>
          ))}
        </div>
      ))}
    </div>
  ),
};

/** Pill shape with a status dot: the badge a status column or a card header uses. */
export const PillWithDot: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<Tag shape="pill" appearance="outline" variant="success" dot>Active</Tag>
<Tag shape="pill" appearance="outline" variant="caution" dot>Paused</Tag>
<Tag shape="pill" appearance="outline" variant="neutral" dot>Archived</Tag>
`.trim(),
      },
    },
  },
  render: () => (
    <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
      {(["sm", "md", "lg"] as const).map((size) => (
        <div key={size} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <Tag size={size} shape="pill" appearance="outline" variant="success" dot>Active</Tag>
          <Tag size={size} shape="pill" appearance="outline" variant="caution" dot>Paused</Tag>
          <Tag size={size} shape="pill" appearance="outline" variant="neutral" dot>Archived</Tag>
        </div>
      ))}
    </div>
  ),
};

/** `onRemove` adds a remove button after the label; `removeLabel` names it. */
export const Removable: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<Tag variant="neutral" appearance="subtle" onRemove={() => {}} removeLabel="Remove Design">Design</Tag>
<Tag variant="brand" appearance="subtle" shape="pill" onRemove={() => {}} removeLabel="Remove Research">Research</Tag>
`.trim(),
      },
    },
  },
  render: () => (
    <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
      <Tag variant="neutral" appearance="subtle" onRemove={() => {}} removeLabel="Remove Design">Design</Tag>
      <Tag variant="brand" appearance="subtle" shape="pill" onRemove={() => {}} removeLabel="Remove Research">
        Research
      </Tag>
      <Tag variant="info" appearance="outline" size="lg" onRemove={() => {}} removeLabel="Remove Engineering">
        Engineering
      </Tag>
    </div>
  ),
};

