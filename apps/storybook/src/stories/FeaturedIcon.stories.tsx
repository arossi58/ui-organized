import type { Meta, StoryObj } from "@storybook/react-vite";
import { FeaturedIcon } from "@ui-organized/react";
import { STORY_ICON_NAMES } from "../storyIcons";

const VARIANTS = ["brand", "neutral", "success", "info", "caution", "error"] as const;
const APPEARANCES = ["subtle", "solid", "outline"] as const;
const SIZES = ["sm", "md", "lg", "xl"] as const;

const meta: Meta<typeof FeaturedIcon> = {
  title: "Components/Data Display/FeaturedIcon",
  component: FeaturedIcon,
  tags: ["!dev"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "An icon in a tinted shape: the piece empty states, modal headers, feature grids and metric cards are built around.",
      },
    },
  },
  argTypes: {
    icon: { control: "select", options: STORY_ICON_NAMES },
    variant: { control: "select", options: VARIANTS },
    appearance: { control: "select", options: APPEARANCES },
    shape: { control: "select", options: ["circle", "square"] },
    size: { control: "select", options: SIZES },
    label: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof FeaturedIcon>;

const row = { display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" as const };

export const Inspect: Story = {
  tags: ["dev"],
  args: { icon: "star", variant: "brand", appearance: "subtle", shape: "circle", size: "md" },
};

export const Colors: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<FeaturedIcon icon="star" variant="brand" />
<FeaturedIcon icon="folder-open" variant="neutral" />
<FeaturedIcon icon="circle-check-big" variant="success" />
<FeaturedIcon icon="info" variant="info" />
<FeaturedIcon icon="triangle-alert" variant="caution" />
<FeaturedIcon icon="circle-alert" variant="error" />
`.trim(),
      },
    },
  },
  render: () => (
    <div style={row}>
      <FeaturedIcon icon="star" variant="brand" />
      <FeaturedIcon icon="folder-open" variant="neutral" />
      <FeaturedIcon icon="circle-check-big" variant="success" />
      <FeaturedIcon icon="info" variant="info" />
      <FeaturedIcon icon="triangle-alert" variant="caution" />
      <FeaturedIcon icon="circle-alert" variant="error" />
    </div>
  ),
};

/** Every colour in every appearance: `subtle` (the default), `solid` and `outline`. */
export const Appearances: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {APPEARANCES.map((appearance) => (
        <div key={appearance} style={row}>
          {VARIANTS.map((variant) => (
            <FeaturedIcon key={variant} icon="star" variant={variant} appearance={appearance} />
          ))}
        </div>
      ))}
    </div>
  ),
};

export const ShapesAndSizes: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<FeaturedIcon icon="mail" size="sm" />
<FeaturedIcon icon="mail" size="md" />
<FeaturedIcon icon="mail" size="lg" />
<FeaturedIcon icon="mail" size="xl" />
<FeaturedIcon icon="mail" shape="square" size="sm" />
<FeaturedIcon icon="mail" shape="square" size="xl" />
`.trim(),
      },
    },
  },
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {(["circle", "square"] as const).map((shape) => (
        <div key={shape} style={row}>
          {SIZES.map((size) => (
            <FeaturedIcon key={size} icon="mail" shape={shape} size={size} />
          ))}
        </div>
      ))}
    </div>
  ),
};

/** Beside a heading that says the same thing, the icon is decorative and needs no label. */
export const WithHeading: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "16px", alignItems: "flex-start", maxWidth: 360 }}>
      <FeaturedIcon icon="upload" variant="brand" size="lg" shape="square" />
      <div>
        <p className="text-default-body-large" style={{ margin: 0, fontWeight: 600, color: "var(--color-content-primary)" }}>
          Upload files
        </p>
        <p className="text-default-body-medium" style={{ margin: "4px 0 0", color: "var(--color-content-secondary)" }}>
          Drop a folder here, or pick files from your device.
        </p>
      </div>
    </div>
  ),
};
