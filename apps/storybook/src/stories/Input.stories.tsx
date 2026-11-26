import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button, Input, Select } from "@ui-organized/react";

const meta: Meta<typeof Input> = {
  title: "Components/Forms/Input",
  component: Input,
  tags: ["!dev"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "A single-line text field.",
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
    disabled: { control: "boolean" },
    required: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Inspect: Story = {
  tags: ["dev"],
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
    helperText: "Must be 3 to 20 characters. Letters and numbers only.",
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
  parameters: {
    docs: {
      source: {
        code: `
<Input size="sm" label="Small" placeholder="Small input" />
<Input size="md" label="Medium" placeholder="Medium input" />
<Input size="lg" label="Large" placeholder="Large input" />
`.trim(),
      },
    },
  },
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "400px" }}>
      <Input size="sm" label="Small" placeholder="Small input" />
      <Input size="md" label="Medium" placeholder="Medium input" />
      <Input size="lg" label="Large" placeholder="Large input" />
    </div>
  ),
};

export const AllStates: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<Input label="Default" placeholder="Placeholder text" />
<Input label="With value" defaultValue="Entered data" />
<Input label="Required" placeholder="Required field" required />
<Input label="With helper" placeholder="Placeholder text" helperText="This is helper text." />
<Input label="Error state" placeholder="Placeholder text" error="This field is required." />
<Input label="Disabled" placeholder="Disabled state" disabled />
`.trim(),
      },
    },
  },
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
  parameters: {
    docs: {
      source: {
        code: `
{(["sm", "md", "lg"] as const).map((size) => (
  <>
    <Input size={size} label={"Size: " + size} placeholder="Default" />
    <Input size={size} label={"Size: " + size + ", required"} placeholder="Required" required />
    <Input size={size} label={"Size: " + size + ", error"} placeholder="Error" error="Error message." />
    <Input size={size} label={"Size: " + size + ", disabled"} placeholder="Disabled" disabled />
  </>
))}
`.trim(),
      },
    },
  },
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "400px" }}>
      {(["sm", "md", "lg"] as const).map((size) => (
        <div key={size} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <Input size={size} label={`Size: ${size}`} placeholder="Default" />
          <Input size={size} label={`Size: ${size}, required`} placeholder="Required" required />
          <Input size={size} label={`Size: ${size}, error`} placeholder="Error" error="Error message." />
          <Input size={size} label={`Size: ${size}, disabled`} placeholder="Disabled" disabled />
        </div>
      ))}
    </div>
  ),
};

const stack = { display: "flex", flexDirection: "column" as const, gap: "20px", width: 360 };

/**
 * Icons sit inside the control (`startIcon`, `endIcon`); add-ons sit beside
 * it inside one border (`startAddon`, `endAddon`): text, or a control of its
 * own such as a ghost Select or a Button.
 */
export const AddOns: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<Input label="Email" startIcon="mail" placeholder="you@example.com" />
<Input label="Website" startAddon="https://" placeholder="example" endAddon=".com" />
<Input
  label="Amount"
  placeholder="0.00"
  endAddon={<Select variant="ghost" label="Currency" defaultValue="usd" options={currencies} />}
/>
<Input label="Share link" defaultValue="https://example.com/r/8f2c" endAddon={<Button intent="secondary" icon="copy">Copy</Button>} />
`.trim(),
      },
    },
  },
  render: () => (
    <div style={stack}>
      <Input label="Email" startIcon="mail" placeholder="you@example.com" />
      <Input label="Website" startAddon="https://" placeholder="example" endAddon=".com" />
      <Input
        label="Amount"
        placeholder="0.00"
        endAddon={
          <Select
            variant="ghost"
            label="Currency"
            defaultValue="usd"
            options={[
              { value: "usd", label: "USD" },
              { value: "eur", label: "EUR" },
              { value: "gbp", label: "GBP" },
            ]}
          />
        }
      />
      <Input
        label="Share link"
        defaultValue="https://example.com/r/8f2c"
        endAddon={
          <Button intent="secondary" icon="copy">
            Copy
          </Button>
        }
      />
    </div>
  ),
};

/** Every size, with text add-ons and an icon. */
export const AddOnSizes: Story = {
  render: () => (
    <div style={stack}>
      {(["sm", "md", "lg"] as const).map((size) => (
        <Input key={size} size={size} label={`Website (${size})`} startAddon="https://" startIcon="search" placeholder="example" endAddon=".com" />
      ))}
    </div>
  ),
};

/** The shell takes the control's states: invalid, and disabled. */
export const AddOnStates: Story = {
  render: () => (
    <div style={stack}>
      <Input label="Website" startAddon="https://" defaultValue="exa mple" endAddon=".com" error="Use letters, numbers and hyphens only." />
      <Input label="Website" startAddon="https://" placeholder="example" endAddon=".com" disabled />
    </div>
  ),
};

