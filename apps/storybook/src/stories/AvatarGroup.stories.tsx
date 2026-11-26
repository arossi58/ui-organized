import type { Meta, StoryObj } from "@storybook/react-vite";
import { AvatarGroup } from "@ui-organized/react";

const MEMBERS = [
  { name: "Ada Lovelace" },
  { name: "Grace Hopper" },
  { name: "Alan Turing" },
  { name: "Katherine Johnson" },
  { name: "Edsger Dijkstra" },
  { name: "Barbara Liskov" },
];

const meta: Meta<typeof AvatarGroup> = {
  title: "Components/Data Display/AvatarGroup",
  component: AvatarGroup,
  tags: ["!dev"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: "Overlapping avatars for the people on something, with a +N for the rest.",
      },
    },
  },
  argTypes: {
    size: { control: "select", options: ["xs", "sm", "md", "lg", "xl"] },
    shape: { control: "select", options: ["circle", "rounded", "square"] },
    max: { control: "number" },
  },
};

export default meta;
type Story = StoryObj<typeof AvatarGroup>;

export const Inspect: Story = {
  tags: ["dev"],
  args: { items: MEMBERS, max: 4, size: "md", label: "Project members" },
};

/** `max` counts the +N as one of its slots: four slots is three avatars and +3. */
export const WithMax: Story = {
  parameters: {
    docs: {
      source: {
        code: `<AvatarGroup items={members} max={4} label="Project members" />`,
      },
    },
  },
  render: () => <AvatarGroup items={MEMBERS} max={4} label="Project members" />,
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {(["xs", "sm", "md", "lg", "xl"] as const).map((size) => (
        <AvatarGroup key={size} items={MEMBERS} max={4} size={size} label={`Members, ${size}`} />
      ))}
    </div>
  ),
};
