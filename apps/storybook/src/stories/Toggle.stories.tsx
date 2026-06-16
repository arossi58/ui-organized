import type { Meta, StoryObj } from "@storybook/react-vite";
import { Toggle, ToggleGroup } from "@ui-organized/react";

const meta: Meta<typeof Toggle> = {
  title: "Components/Actions/Toggle",
  component: Toggle,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A two-state button that can be on or off. Use a standalone `<Toggle>` (`pressed`/`defaultPressed`) or group several inside `<ToggleGroup>` for single- or multi-select.",
      },
    },
  },
  argTypes: {
    size: { control: "select", options: ["sm", "md", "lg"] },
    disabled: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof Toggle>;

export const Default: Story = {
  render: (args) => (
    <Toggle {...args}>
      <span>Bookmark</span>
    </Toggle>
  ),
  args: { icon: "bookmark", defaultPressed: false, size: "md" },
};

export const SingleSelectGroup: Story = {
  render: () => (
    <ToggleGroup defaultValue={["grid"]}>
      <Toggle value="list" icon="list" aria-label="List view" />
      <Toggle value="grid" icon="grid" aria-label="Grid view" />
    </ToggleGroup>
  ),
};

export const MultiSelectGroup: Story = {
  render: () => (
    <ToggleGroup defaultValue={["star"]} multiple>
      <Toggle value="star" icon="star" aria-label="Star" />
      <Toggle value="heart" icon="heart" aria-label="Heart" />
      <Toggle value="bookmark" icon="bookmark" aria-label="Bookmark" />
    </ToggleGroup>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <Toggle size="sm" defaultPressed>sm</Toggle>
      <Toggle size="md" defaultPressed>md</Toggle>
      <Toggle size="lg" defaultPressed>lg</Toggle>
    </div>
  ),
};
