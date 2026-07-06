import type { Meta, StoryObj } from "@storybook/react-vite";
import { FieldError, Input } from "@ui-organized/react";

const meta: Meta<typeof FieldError> = {
  title: "Components/Forms/FieldError",
  component: FieldError,
  tags: ["!dev"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "FieldError renders a validation error pill from the message passed as `children`, and renders nothing when the message is empty; it typically sits beneath an invalid form control.",
      },
    },
  },
  argTypes: {
    children: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof FieldError>;

/** The error pill on its own, matching Figma 580:7201. */
export const Inspect: Story = {
  tags: ["dev"],
  args: {
    children: "Error message",
  },
};

/** Renders nothing when there is no message. */
export const Empty: Story = {
  args: {
    children: "",
  },
};

/** Longer copy wraps inside the pill rather than overflowing the field. */
export const LongMessage: Story = {
  args: {
    children: "Please enter a valid email address before continuing.",
  },
};

/** How it appears in context, wired under an invalid form control. */
export const InFormContext: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<Input
  label="Email"
  placeholder="you@example.com"
  defaultValue="not-an-email"
  error="Enter a valid email address."
/>
`.trim(),
      },
    },
  },
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "320px" }}>
      <Input
        label="Email"
        placeholder="you@example.com"
        defaultValue="not-an-email"
        error="Enter a valid email address."
      />
    </div>
  ),
};
