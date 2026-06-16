import type { Meta, StoryObj } from "@storybook/react-vite";
import { Avatar } from "@ui-organized/react";

const PHOTO =
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=128&h=128&fit=crop&crop=faces";

const meta: Meta<typeof Avatar> = {
  title: "Components/Data Display/Avatar",
  component: Avatar,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Represents a user with an image, deriving initials from `name` (or a user icon) when no image is available. Control `size` and `shape`.",
      },
    },
  },
  argTypes: {
    size: { control: "select", options: ["xs", "sm", "md", "lg", "xl"] },
    shape: { control: "select", options: ["circle", "rounded", "square"] },
  },
};

export default meta;
type Story = StoryObj<typeof Avatar>;

export const WithImage: Story = {
  args: { src: PHOTO, name: "Ada Lovelace", size: "md", shape: "circle" },
};

export const Initials: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
      <Avatar name="Ada Lovelace" />
      <Avatar name="Grace Hopper" />
      <Avatar name="Linus" />
    </div>
  ),
};

export const IconFallback: Story = {
  render: () => <Avatar size="lg" />,
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
      {(["xs", "sm", "md", "lg", "xl"] as const).map((size) => (
        <Avatar key={size} name="Ada Lovelace" size={size} />
      ))}
    </div>
  ),
};

export const Shapes: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
      {(["circle", "rounded", "square"] as const).map((shape) => (
        <Avatar key={shape} src={PHOTO} name="Ada Lovelace" size="lg" shape={shape} />
      ))}
    </div>
  ),
};
