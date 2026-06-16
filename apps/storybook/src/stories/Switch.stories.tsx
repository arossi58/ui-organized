import type { Meta, StoryObj } from "@storybook/react-vite";
import { Switch } from "@ui-organized/react";

const meta: Meta<typeof Switch> = {
  title: "Components/Forms/Switch",
  component: Switch,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Switch is an on/off toggle for an immediate setting; use `label` for the caption, `checked` / `defaultChecked` for state, and `disabled` / `required` for form behavior.",
      },
    },
  },
  argTypes: {
    label: { control: "text" },
    checked: { control: "boolean" },
    disabled: { control: "boolean" },
    required: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof Switch>;

export const Default: Story = {
  args: {
    label: "Enable notifications",
  },
};

export const Checked: Story = {
  args: {
    label: "Dark mode",
    defaultChecked: true,
  },
};

export const Disabled: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<Switch label="Disabled off" disabled />
<Switch label="Disabled on" disabled defaultChecked />
`.trim(),
      },
    },
  },
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <Switch label="Disabled off" disabled />
      <Switch label="Disabled on" disabled defaultChecked />
    </div>
  ),
};

export const AllStates: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<Switch label="Off state" />
<Switch label="On state" defaultChecked />
<Switch label="Disabled off" disabled />
<Switch label="Disabled on" disabled defaultChecked />
`.trim(),
      },
    },
  },
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <Switch label="Off state" />
      <Switch label="On state" defaultChecked />
      <Switch label="Disabled off" disabled />
      <Switch label="Disabled on" disabled defaultChecked />
    </div>
  ),
};

export const WithoutLabel: Story = {
  args: {},
};
