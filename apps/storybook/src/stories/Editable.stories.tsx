import type { Meta, StoryObj } from "@storybook/react-vite";
import { Editable } from "@ui-organized/react";

const meta: Meta<typeof Editable> = {
  title: "Components/Forms/Editable",
  component: Editable,
  tags: ["!dev"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "A value that reads as text until you edit it in place — page titles, list item names, anything renamed far more rarely than it is read. The preview and the input occupy the same box, so the text never shifts when the edit starts.",
      },
    },
  },
  argTypes: {
    size: { control: "select", options: ["sm", "md", "lg"] },
    activationMode: { control: "select", options: ["focus", "dblclick", "click", "none"] },
    submitMode: { control: "select", options: ["blur", "enter", "both", "none"] },
  },
};

export default meta;
type Story = StoryObj<typeof Editable>;

export const Inspect: Story = {
  tags: ["dev"],
  args: {
    label: "Project name",
    defaultValue: "Untitled project",
    placeholder: "Name this project",
    size: "md",
  },
};

export const WithControls: Story = {
  render: () => (
    <Editable
      label="Display name"
      defaultValue="Ada Lovelace"
      showControls
      activationMode="click"
      submitMode="enter"
    />
  ),
  parameters: {
    docs: {
      source: {
        code: `{/* Explicit Save/Cancel — use when committing has a real cost. */}
<Editable
  label="Display name"
  defaultValue="Ada Lovelace"
  showControls
  activationMode="click"
  submitMode="enter"
/>`,
      },
    },
  },
};

export const DoubleClickToEdit: Story = {
  render: () => (
    <Editable
      label="Board title"
      helperText="Double-click the title to rename it."
      defaultValue="Q3 roadmap"
      activationMode="dblclick"
    />
  ),
  parameters: {
    docs: {
      source: {
        code: `<Editable
  label="Board title"
  helperText="Double-click the title to rename it."
  defaultValue="Q3 roadmap"
  activationMode="dblclick"
/>`,
      },
    },
  },
};

export const Placeholder: Story = {
  render: () => <Editable label="Nickname" placeholder="Add a nickname" />,
  parameters: {
    docs: {
      source: { code: `<Editable label="Nickname" placeholder="Add a nickname" />` },
    },
  },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Editable label="Small" size="sm" defaultValue="Small value" />
      <Editable label="Medium" size="md" defaultValue="Medium value" />
      <Editable label="Large" size="lg" defaultValue="Large value" />
    </div>
  ),
  parameters: {
    docs: {
      source: {
        code: `<Editable label="Small"  size="sm" defaultValue="Small value" />
<Editable label="Medium" size="md" defaultValue="Medium value" />
<Editable label="Large"  size="lg" defaultValue="Large value" />`,
      },
    },
  },
};
