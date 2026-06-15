import type { Meta, StoryObj } from "@storybook/react-vite";
import { Input } from "@ui-organized/react";

const meta: Meta<typeof Input> = {
  title: "Components/Input",
  component: Input,
  parameters: {
    layout: "padded",
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
    disabled: { control: "boolean" },
    required: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: {
    label: "Email address",
    placeholder: "you@example.com",
    size: "md",
  },
};

export const Required: Story = {
  args: {
    label: "Email address",
    placeholder: "you@example.com",
    required: true,
  },
};

export const WithHelperText: Story = {
  args: {
    label: "Username",
    placeholder: "johndoe",
    helperText: "Must be 3–20 characters. Letters and numbers only.",
  },
};

export const WithError: Story = {
  args: {
    label: "Email address",
    placeholder: "you@example.com",
    error: "Please enter a valid email address.",
  },
};

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "400px" }}>
      <Input size="sm" label="Small" placeholder="Small input" />
      <Input size="md" label="Medium" placeholder="Medium input" />
      <Input size="lg" label="Large" placeholder="Large input" />
    </div>
  ),
};

export const AllStates: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "400px" }}>
      <Input label="Default" placeholder="Placeholder text" />
      <Input label="With value" defaultValue="Entered data" />
      <Input label="Required" placeholder="Required field" required />
      <Input label="With helper" placeholder="Placeholder text" helperText="This is helper text." />
      <Input label="Error state" placeholder="Placeholder text" error="This field is required." />
      <Input label="Disabled" placeholder="Disabled state" disabled />
    </div>
  ),
};

export const AllVariantsGrid: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "400px" }}>
      {(["sm", "md", "lg"] as const).map((size) => (
        <div key={size} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <Input size={size} label={`Size: ${size}`} placeholder="Default" />
          <Input size={size} label={`Size: ${size} — required`} placeholder="Required" required />
          <Input size={size} label={`Size: ${size} — error`} placeholder="Error" error="Error message." />
          <Input size={size} label={`Size: ${size} — disabled`} placeholder="Disabled" disabled />
        </div>
      ))}
    </div>
  ),
};
