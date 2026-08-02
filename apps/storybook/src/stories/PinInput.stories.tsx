import type { Meta, StoryObj } from "@storybook/react-vite";
import { PinInput } from "@ui-organized/react";

const meta: Meta<typeof PinInput> = {
  title: "Components/Forms/PinInput",
  component: PinInput,
  tags: ["!dev"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "A fixed-length code entered one character per cell — verification codes, PINs, 2FA. The public `value` is the whole code as a single string; the per-cell array stays inside the component. Set `otp` so browsers and password managers offer to autofill an SMS code.",
      },
    },
  },
  argTypes: {
    size: { control: "select", options: ["sm", "md", "lg"] },
    variant: { control: "select", options: ["default", "underline"] },
    type: { control: "select", options: ["numeric", "alphanumeric", "alphabetic"] },
    length: { control: { type: "range", min: 3, max: 8 } },
  },
};

export default meta;
type Story = StoryObj<typeof PinInput>;

export const Inspect: Story = {
  tags: ["dev"],
  args: {
    label: "Verification code",
    length: 4,
    size: "md",
    variant: "default",
    type: "numeric",
  },
};

export const Underline: Story = {
  render: () => (
    <PinInput label="Verification code" variant="underline" length={6} defaultValue="12" />
  ),
  parameters: {
    docs: {
      source: {
        code: `<PinInput label="Verification code" variant="underline" length={6} defaultValue="12" />`,
      },
    },
  },
};

export const OneTimeCode: Story = {
  render: () => (
    <PinInput
      label="Enter the code we texted you"
      helperText="Six digits, no spaces."
      length={6}
      otp
      type="numeric"
    />
  ),
  parameters: {
    docs: {
      source: {
        code: `{/* \`otp\` sets autocomplete="one-time-code" so the OS can autofill it. */}
<PinInput
  label="Enter the code we texted you"
  helperText="Six digits, no spaces."
  length={6}
  otp
  type="numeric"
/>`,
      },
    },
  },
};

export const Masked: Story = {
  render: () => <PinInput label="PIN" length={4} mask defaultValue="1234" />,
  parameters: {
    docs: {
      source: { code: `<PinInput label="PIN" length={4} mask defaultValue="1234" />` },
    },
  },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <PinInput label="Small" size="sm" length={4} defaultValue="12" />
      <PinInput label="Medium" size="md" length={4} defaultValue="12" />
      <PinInput label="Large" size="lg" length={4} defaultValue="12" />
    </div>
  ),
  parameters: {
    docs: {
      source: {
        code: `<PinInput label="Small"  size="sm" length={4} />
<PinInput label="Medium" size="md" length={4} />
<PinInput label="Large"  size="lg" length={4} />`,
      },
    },
  },
};

export const Invalid: Story = {
  render: () => (
    <PinInput label="Verification code" length={4} defaultValue="1234" error="That code has expired." />
  ),
  parameters: {
    docs: {
      source: {
        code: `<PinInput
  label="Verification code"
  length={4}
  defaultValue="1234"
  error="That code has expired."
/>`,
      },
    },
  },
};
