import type { Meta, StoryObj } from "@storybook/react-vite";
import { Combobox } from "@ui-organized/react";

const FRUITS = [
  { value: "apple", label: "Apple" },
  { value: "banana", label: "Banana" },
  { value: "blueberry", label: "Blueberry" },
  { value: "grapes", label: "Grapes" },
  { value: "orange", label: "Orange" },
  { value: "pineapple", label: "Pineapple" },
  { value: "strawberry", label: "Strawberry" },
];

const meta: Meta<typeof Combobox> = {
  title: "Components/Forms/Combobox",
  component: Combobox,
  tags: ["!dev"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "A searchable Select. Type to filter `options` by label; shows an empty state when nothing matches. Mirrors Select's field API (label, helper text, error, sizes).",
      },
    },
  },
  argTypes: {
    size: { control: "select", options: ["sm", "md", "lg"] },
    disabled: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof Combobox>;

export const Inspect: Story = {
  tags: ["dev"],
  render: (args) => (
    <div style={{ width: 280 }}>
      <Combobox {...args} />
    </div>
  ),
  args: {
    label: "Favorite fruit",
    placeholder: "Search fruits…",
    options: FRUITS,
    helperText: "Start typing to filter",
  },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, width: 280 }}>
      <Combobox label="Small" size="sm" placeholder="Search…" options={FRUITS} />
      <Combobox label="Medium" size="md" placeholder="Search…" options={FRUITS} />
      <Combobox label="Large" size="lg" placeholder="Search…" options={FRUITS} />
    </div>
  ),
};

export const WithError: Story = {
  render: () => (
    <div style={{ width: 280 }}>
      <Combobox label="Fruit" placeholder="Search…" options={FRUITS} error="Please pick one" />
    </div>
  ),
};
