import type { Meta, StoryObj } from "@storybook/react-vite";
import { Toggle, ToggleGroup } from "@ui-organized/react";

const meta: Meta<typeof Toggle> = {
  title: "Components/Actions/Toggle",
  component: Toggle,
  tags: ["!dev"],
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

export const Inspect: Story = {
  tags: ["dev"],
  render: (args) => (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 24 }}>
      <Toggle {...args}>
        <span>Bookmark</span>
      </Toggle>

      {/* Multi-select group with labels. */}
      <ToggleGroup defaultValue={["bold"]} multiple>
        <Toggle value="bold">Bold</Toggle>
        <Toggle value="italic">Italic</Toggle>
        <Toggle value="underline">Underline</Toggle>
      </ToggleGroup>

      {/* Multi-select icon-only group. */}
      <ToggleGroup defaultValue={["star"]} multiple>
        <Toggle value="star" icon="star" aria-label="Star" />
        <Toggle value="heart" icon="heart" aria-label="Heart" />
        <Toggle value="bookmark" icon="bookmark" aria-label="Bookmark" />
      </ToggleGroup>
    </div>
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
