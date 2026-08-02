import type { Meta, StoryObj } from "@storybook/react-vite";
import { Listbox } from "@ui-organized/react";

const FRUIT_OPTIONS = [
  { value: "apple", label: "Apple" },
  { value: "banana", label: "Banana" },
  { value: "cherry", label: "Cherry" },
  { value: "durian", label: "Durian", disabled: true },
  { value: "elderberry", label: "Elderberry" },
];

const GROUPED_OPTIONS = [
  { value: "apple", label: "Apple", group: "Fruit" },
  { value: "banana", label: "Banana", group: "Fruit" },
  { value: "carrot", label: "Carrot", group: "Vegetable" },
  { value: "daikon", label: "Daikon", group: "Vegetable" },
];

const meta: Meta<typeof Listbox> = {
  title: "Components/Forms/Listbox",
  component: Listbox,
  tags: ["!dev"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "A standing list of selectable options — the list itself, always visible, with no trigger and no popup. Use `Select` when the list should collapse into a control, and `Listbox` when the options are the interface.",
      },
    },
  },
  argTypes: {
    size: { control: "select", options: ["sm", "md", "lg"] },
    variant: { control: "select", options: ["default", "bordered"] },
    selectionMode: { control: "select", options: ["single", "multiple", "extended"] },
  },
};

export default meta;
type Story = StoryObj<typeof Listbox>;

export const Inspect: Story = {
  tags: ["dev"],
  render: (args) => (
    <div style={{ width: 280 }}>
      <Listbox {...args} />
    </div>
  ),
  args: {
    label: "Pick a fruit",
    options: FRUIT_OPTIONS,
    defaultValue: ["apple"],
    size: "md",
    variant: "bordered",
    selectionMode: "single",
  },
};

export const Multiple: Story = {
  render: () => (
    <div style={{ width: 280 }}>
      <Listbox
        label="Pick any"
        options={FRUIT_OPTIONS}
        selectionMode="multiple"
        defaultValue={["apple", "cherry"]}
        variant="bordered"
      />
    </div>
  ),
  parameters: {
    docs: {
      source: {
        code: `<Listbox
  label="Pick any"
  options={FRUIT_OPTIONS}
  selectionMode="multiple"
  defaultValue={["apple", "cherry"]}
  variant="bordered"
/>`,
      },
    },
  },
};

export const Grouped: Story = {
  render: () => (
    <div style={{ width: 280 }}>
      <Listbox label="Produce" options={GROUPED_OPTIONS} variant="bordered" />
    </div>
  ),
  parameters: {
    docs: {
      source: {
        code: `const GROUPED_OPTIONS = [
  { value: "apple",  label: "Apple",  group: "Fruit" },
  { value: "banana", label: "Banana", group: "Fruit" },
  { value: "carrot", label: "Carrot", group: "Vegetable" },
  { value: "daikon", label: "Daikon", group: "Vegetable" },
];

<Listbox label="Produce" options={GROUPED_OPTIONS} variant="bordered" />`,
      },
    },
  },
};

export const Empty: Story = {
  render: () => (
    <div style={{ width: 280 }}>
      <Listbox
        label="Search results"
        options={[]}
        emptyMessage="No matches for that search."
        variant="bordered"
      />
    </div>
  ),
  parameters: {
    docs: {
      source: {
        code: `<Listbox
  label="Search results"
  options={[]}
  emptyMessage="No matches for that search."
  variant="bordered"
/>`,
      },
    },
  },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 24 }}>
      <Listbox label="Small" size="sm" options={FRUIT_OPTIONS} variant="bordered" />
      <Listbox label="Medium" size="md" options={FRUIT_OPTIONS} variant="bordered" />
      <Listbox label="Large" size="lg" options={FRUIT_OPTIONS} variant="bordered" />
    </div>
  ),
  parameters: {
    docs: {
      source: {
        code: `<Listbox label="Small"  size="sm" options={FRUIT_OPTIONS} variant="bordered" />
<Listbox label="Medium" size="md" options={FRUIT_OPTIONS} variant="bordered" />
<Listbox label="Large"  size="lg" options={FRUIT_OPTIONS} variant="bordered" />`,
      },
    },
  },
};
