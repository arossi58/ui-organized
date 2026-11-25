import type { Meta, StoryObj } from "@storybook/react-vite";
import { TagGroup } from "@ui-organized/react";

const COLORS = ["brand", "neutral", "success", "info", "info-secondary", "caution", "error"] as const;

const meta: Meta<typeof TagGroup> = {
  title: "Components/Data Display/TagGroup",
  component: TagGroup,
  tags: ["!dev"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "The announcement pill: a short tag and a message in one pill. One pill, not a list of tags.",
      },
    },
  },
  argTypes: {
    variant: { control: "select", options: COLORS },
    size: { control: "select", options: ["md", "lg"] },
    tagPosition: { control: "select", options: ["leading", "trailing"] },
    tag: { control: "text" },
    children: { control: "text" },
    href: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof TagGroup>;

export const Inspect: Story = {
  tags: ["dev"],
  args: { tag: "New", children: "We've shipped dark mode", variant: "brand", size: "md", href: "#" },
};

/** As a link: the whole pill is one `<a>`, with a trailing chevron. */
export const AsLink: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<TagGroup tag="New" href="/changelog">We've shipped dark mode</TagGroup>
<TagGroup tag="v6.2" href="/changelog" tagPosition="trailing">See what changed in</TagGroup>
`.trim(),
      },
    },
  },
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px", alignItems: "flex-start" }}>
      <TagGroup tag="New" href="#">We've shipped dark mode</TagGroup>
      <TagGroup tag="v6.2" href="#" tagPosition="trailing">See what changed in</TagGroup>
    </div>
  ),
};

export const Colors: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px", alignItems: "flex-start" }}>
      {COLORS.map((variant) => (
        <TagGroup key={variant} variant={variant} tag={variant}>
          A message in the {variant} colour
        </TagGroup>
      ))}
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px", alignItems: "flex-start" }}>
      <TagGroup size="md" tag="Beta" href="#">Try the new editor</TagGroup>
      <TagGroup size="lg" tag="Beta" href="#">Try the new editor</TagGroup>
    </div>
  ),
};
