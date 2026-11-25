import type { Meta, StoryObj } from "@storybook/react-vite";
import { AvatarLabel } from "@ui-organized/react";

const meta: Meta<typeof AvatarLabel> = {
  title: "Components/Data Display/AvatarLabel",
  component: AvatarLabel,
  tags: ["!dev"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: "An avatar with a name and a line of supporting text beside it.",
      },
    },
  },
  argTypes: {
    size: { control: "select", options: ["sm", "md", "lg", "xl"] },
    shape: { control: "select", options: ["circle", "rounded", "square"] },
    status: { control: "select", options: [undefined, "online", "away", "busy", "offline"] },
    verified: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof AvatarLabel>;

export const Inspect: Story = {
  tags: ["dev"],
  args: { name: "Ada Lovelace", description: "ada@example.com", size: "md" },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {(["sm", "md", "lg", "xl"] as const).map((size) => (
        <AvatarLabel key={size} size={size} name="Ada Lovelace" description="ada@example.com" />
      ))}
    </div>
  ),
};

/** The avatar's badges are drawn on it and announced after the name. */
export const WithStatus: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<AvatarLabel name="Ada Lovelace" description="Engineering lead" status="online" verified />
<AvatarLabel name="Grace Hopper" description="On leave until Monday" status="away" />
`.trim(),
      },
    },
  },
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <AvatarLabel name="Ada Lovelace" description="Engineering lead" status="online" verified />
      <AvatarLabel name="Grace Hopper" description="On leave until Monday" status="away" />
    </div>
  ),
};
