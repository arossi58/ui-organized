import type { Meta, StoryObj } from "@storybook/react-vite";
import { TagsInput } from "@ui-organized/react";

const meta: Meta<typeof TagsInput> = {
  title: "Components/Forms/TagsInput",
  component: TagsInput,
  tags: ["!dev"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Free-text entry that turns each committed value into a removable chip — recipients, labels, keywords. Enter adds, Backspace on an empty field removes the last chip, and a double-click edits one in place. Reach for `Combobox` instead when the values come from a known list.",
      },
    },
  },
  argTypes: {
    size: { control: "select", options: ["sm", "md", "lg"] },
    max: { control: { type: "number" } },
  },
};

export default meta;
type Story = StoryObj<typeof TagsInput>;

export const Inspect: Story = {
  tags: ["dev"],
  args: {
    label: "Topics",
    placeholder: "Add a topic…",
    defaultValue: ["design systems", "accessibility"],
    size: "md",
  },
};

export const WithMax: Story = {
  render: () => (
    <TagsInput
      label="Recipients"
      helperText="Up to three people."
      placeholder="Add an email…"
      max={3}
    />
  ),
  parameters: {
    docs: {
      source: {
        code: `<TagsInput
  label="Recipients"
  helperText="Up to three people."
  placeholder="Add an email…"
  max={3}
/>`,
      },
    },
  },
};

export const PasteToSplit: Story = {
  render: () => (
    <TagsInput
      label="Keywords"
      helperText="Paste a comma-separated list to add several at once."
      placeholder="Add a keyword…"
      addOnPaste
      delimiter=","
    />
  ),
  parameters: {
    docs: {
      source: {
        code: `<TagsInput
  label="Keywords"
  helperText="Paste a comma-separated list to add several at once."
  placeholder="Add a keyword…"
  addOnPaste
  delimiter=","
/>`,
      },
    },
  },
};

export const Invalid: Story = {
  render: () => (
    <TagsInput
      label="Recipients"
      defaultValue={["ana@example.com", "not-an-email"]}
      error="One of those isn't a valid email address."
    />
  ),
  parameters: {
    docs: {
      source: {
        code: `<TagsInput
  label="Recipients"
  defaultValue={["ana@example.com", "not-an-email"]}
  error="One of those isn't a valid email address."
/>`,
      },
    },
  },
};
