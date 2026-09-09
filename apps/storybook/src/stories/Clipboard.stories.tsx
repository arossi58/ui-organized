import type { Meta, StoryObj } from "@storybook/react-vite";
import { Clipboard } from "@ui-organized/react";

const meta: Meta<typeof Clipboard> = {
  title: "Components/Actions/Clipboard",
  component: Clipboard,
  tags: ["!dev"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Copies a string to the clipboard and confirms it did. The trigger swaps its icon and label for a few seconds after copying, which is the whole feedback mechanism — no toast required. `input` shows the value being copied; `button` is the trigger alone.",
      },
    },
  },
  argTypes: {
    size: { control: "select", options: ["sm", "md", "lg"] },
    variant: { control: "select", options: ["input", "button"] },
  },
};

export default meta;
type Story = StoryObj<typeof Clipboard>;

export const Inspect: Story = {
  tags: ["dev"],
  args: {
    label: "Share link",
    value: "https://ui-organized.dev/docs/clipboard",
    variant: "input",
    size: "md",
  },
};

export const ButtonOnly: Story = {
  render: () => <Clipboard variant="button" value="npm install @ui-organized/react" />,
  parameters: {
    docs: {
      source: {
        code: `<Clipboard variant="button" value="npm install @ui-organized/react" />`,
      },
    },
  },
};

export const WithHelperText: Story = {
  render: () => (
    <Clipboard
      label="API key"
      helperText="Treat this like a password — it grants full account access."
      value="example_key_0000000000000000000000"
    />
  ),
  parameters: {
    docs: {
      source: {
        code: `<Clipboard
  label="API key"
  helperText="Treat this like a password — it grants full account access."
  value="example_key_0000000000000000000000"
/>`,
      },
    },
  },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <Clipboard label="Small" size="sm" value="https://example.com/s" />
      <Clipboard label="Medium" size="md" value="https://example.com/m" />
      <Clipboard label="Large" size="lg" value="https://example.com/l" />
    </div>
  ),
  parameters: {
    docs: {
      source: {
        code: `<Clipboard label="Small"  size="sm" value="https://example.com/s" />
<Clipboard label="Medium" size="md" value="https://example.com/m" />
<Clipboard label="Large"  size="lg" value="https://example.com/l" />`,
      },
    },
  },
};
