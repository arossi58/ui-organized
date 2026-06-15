import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { PasswordInput } from "@ui-organized/react";

const meta: Meta<typeof PasswordInput> = {
  title: "Components/PasswordInput",
  component: PasswordInput,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "A password field built on `Input` — adds a trailing show/hide toggle that switches the control between masked and plain text (toggle with `showToggle`). Supports the same `label`, `helperText`, `error`, `size`, and `required` / `disabled` props.",
      },
    },
  },
  argTypes: {
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
    label: { control: "text" },
    placeholder: { control: "text" },
    helperText: { control: "text" },
    error: { control: "text" },
    showToggle: { control: "boolean" },
    disabled: { control: "boolean" },
    required: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof PasswordInput>;

export const Default: Story = {
  args: {
    label: "Password",
    placeholder: "Enter your password",
    size: "md",
  },
};

export const Required: Story = {
  args: {
    label: "Password",
    placeholder: "Enter your password",
    required: true,
  },
};

export const WithHelperText: Story = {
  args: {
    label: "New password",
    placeholder: "Enter your password",
    helperText: "Must be at least 8 characters.",
  },
};

export const WithError: Story = {
  args: {
    label: "Password",
    placeholder: "Enter your password",
    error: "Password must be at least 8 characters.",
  },
};

export const NoToggle: Story = {
  args: {
    label: "Password",
    placeholder: "Enter your password",
    showToggle: false,
  },
};

export const AllSizes: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<PasswordInput size="sm" label="Small" placeholder="Enter your password" />
<PasswordInput size="md" label="Medium" placeholder="Enter your password" />
<PasswordInput size="lg" label="Large" placeholder="Enter your password" />
`.trim(),
      },
    },
  },
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "400px" }}>
      <PasswordInput size="sm" label="Small" placeholder="Enter your password" />
      <PasswordInput size="md" label="Medium" placeholder="Enter your password" />
      <PasswordInput size="lg" label="Large" placeholder="Enter your password" />
    </div>
  ),
};

export const AllStates: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<PasswordInput label="Default" placeholder="Enter your password" />
<PasswordInput label="With value" defaultValue="hunter2pass" />
<PasswordInput label="Required" placeholder="Enter your password" required />
<PasswordInput label="With helper" placeholder="Enter your password" helperText="Must be at least 8 characters." />
<PasswordInput label="Error state" placeholder="Enter your password" error="Password is too short." />
<PasswordInput label="Disabled" defaultValue="hunter2pass" disabled />
`.trim(),
      },
    },
  },
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "400px" }}>
      <PasswordInput label="Default" placeholder="Enter your password" />
      <PasswordInput label="With value" defaultValue="hunter2pass" />
      <PasswordInput label="Required" placeholder="Enter your password" required />
      <PasswordInput label="With helper" placeholder="Enter your password" helperText="Must be at least 8 characters." />
      <PasswordInput label="Error state" placeholder="Enter your password" error="Password is too short." />
      <PasswordInput label="Disabled" defaultValue="hunter2pass" disabled />
    </div>
  ),
};

/** Live strength hint driven from the controlled value. */
export const Controlled: Story = {
  parameters: {
    docs: {
      source: {
        code: `
const [value, setValue] = useState("");
const strength =
  value.length === 0 ? "" : value.length < 8 ? "Weak" : value.length < 12 ? "Good" : "Strong";

<PasswordInput
  label="Create password"
  placeholder="Enter your password"
  value={value}
  onChange={(e) => setValue(e.target.value)}
  helperText={strength ? "Strength: " + strength : "Must be at least 8 characters."}
/>
`.trim(),
      },
    },
  },
  render: () => {
    const [value, setValue] = useState("");
    const strength =
      value.length === 0 ? "" : value.length < 8 ? "Weak" : value.length < 12 ? "Good" : "Strong";
    return (
      <div style={{ maxWidth: "400px" }}>
        <PasswordInput
          label="Create password"
          placeholder="Enter your password"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          helperText={strength ? `Strength: ${strength}` : "Must be at least 8 characters."}
        />
      </div>
    );
  },
};
