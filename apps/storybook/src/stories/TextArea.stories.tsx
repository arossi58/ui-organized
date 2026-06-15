import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { TextArea } from "@ui-organized/react";

const meta: Meta<typeof TextArea> = {
  title: "Components/TextArea",
  component: TextArea,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "A multi-line text field with an optional `label`, `helperText`, and `error` message; use `size` for density, `resize` to control the drag handle, and the `required` / `disabled` booleans for state.",
      },
    },
  },
  argTypes: {
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
    resize: {
      control: "select",
      options: ["none", "vertical", "horizontal", "both"],
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
type Story = StoryObj<typeof TextArea>;

export const Default: Story = {
  args: {
    label: "Label",
    placeholder: "Your input",
    helperText: "Characters 0/500",
    size: "lg",
  },
};

export const Required: Story = {
  args: {
    label: "Bio",
    placeholder: "Tell us about yourself",
    helperText: "Characters 0/500",
    required: true,
  },
};

export const WithError: Story = {
  args: {
    label: "Label",
    placeholder: "Your input",
    error: "Error message",
  },
};

export const Disabled: Story = {
  args: {
    label: "Label",
    placeholder: "Your input",
    helperText: "Characters 0/500",
    disabled: true,
  },
};

export const AllSizes: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<TextArea size="sm" label="Small" placeholder="Your input" helperText="Characters 0/500" />
<TextArea size="md" label="Medium" placeholder="Your input" helperText="Characters 0/500" />
<TextArea size="lg" label="Large" placeholder="Your input" helperText="Characters 0/500" />
`.trim(),
      },
    },
  },
  render: () => (
    <div style={{ display: "flex", gap: "16px", alignItems: "flex-start", maxWidth: "1000px" }}>
      <TextArea size="sm" label="Small" placeholder="Your input" helperText="Characters 0/500" />
      <TextArea size="md" label="Medium" placeholder="Your input" helperText="Characters 0/500" />
      <TextArea size="lg" label="Large" placeholder="Your input" helperText="Characters 0/500" />
    </div>
  ),
};

export const AllStates: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<TextArea label="Default" placeholder="Your input" helperText="Characters 0/500" />
<TextArea label="With value" defaultValue="Entered data" helperText="Characters 11/500" />
<TextArea label="Required" placeholder="Your input" required helperText="Characters 0/500" />
<TextArea label="Error state" placeholder="Your input" error="Error message" />
<TextArea label="Disabled" placeholder="Your input" disabled helperText="Characters 0/500" />
`.trim(),
      },
    },
  },
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "400px" }}>
      <TextArea label="Default" placeholder="Your input" helperText="Characters 0/500" />
      <TextArea label="With value" defaultValue="Entered data" helperText="Characters 11/500" />
      <TextArea label="Required" placeholder="Your input" required helperText="Characters 0/500" />
      <TextArea label="Error state" placeholder="Your input" error="Error message" />
      <TextArea label="Disabled" placeholder="Your input" disabled helperText="Characters 0/500" />
    </div>
  ),
};

/** Drag the bottom-right handle of each field to resize it in the allowed directions. */
export const Resize: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<TextArea label="Both (default)" placeholder="Resize me in any direction" resize="both" />
<TextArea label="Vertical only" placeholder="Resize me up/down" resize="vertical" />
<TextArea label="Horizontal only" placeholder="Resize me left/right" resize="horizontal" />
<TextArea label="No resize" placeholder="Fixed size" resize="none" />
`.trim(),
      },
    },
  },
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "400px" }}>
      <TextArea label="Both (default)" placeholder="Resize me in any direction" resize="both" />
      <TextArea label="Vertical only" placeholder="Resize me up/down" resize="vertical" />
      <TextArea label="Horizontal only" placeholder="Resize me left/right" resize="horizontal" />
      <TextArea label="No resize" placeholder="Fixed size" resize="none" />
    </div>
  ),
};

/** Live character counter — the canonical use of the helper text (Figma "Characters 0/500"). */
export const CharacterCounter: Story = {
  parameters: {
    docs: {
      source: {
        code: `
const max = 500;
const [value, setValue] = useState("");

<TextArea
  label="Message"
  placeholder="Your input"
  maxLength={max}
  value={value}
  onChange={(e) => setValue(e.target.value)}
  helperText={"Characters " + value.length + "/" + max}
/>
`.trim(),
      },
    },
  },
  render: () => {
    const max = 500;
    const [value, setValue] = useState("");
    return (
      <div style={{ maxWidth: "400px" }}>
        <TextArea
          label="Message"
          placeholder="Your input"
          maxLength={max}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          helperText={`Characters ${value.length}/${max}`}
        />
      </div>
    );
  },
};
