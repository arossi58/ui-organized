import type { Meta, StoryObj } from "@storybook/react-vite";
import { Select } from "@ui-organized/react";

const FRUIT_OPTIONS = [
  { value: "apple", label: "Apple" },
  { value: "banana", label: "Banana" },
  { value: "cherry", label: "Cherry" },
  { value: "durian", label: "Durian", disabled: true },
  { value: "elderberry", label: "Elderberry" },
];

const meta: Meta<typeof Select> = {
  title: "Components/Forms/Select",
  component: Select,
  tags: ["!dev"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "A dropdown field driven by an `options` array (each with `value`, `label`, and optional `disabled`); supports a `label`, `helperText`, and `error` message, plus `size` for density and the `required` / `disabled` booleans for state.",
      },
    },
  },
  argTypes: {
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
    variant: {
      control: "inline-radio",
      options: ["default", "ghost"],
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
type Story = StoryObj<typeof Select>;

export const Inspect: Story = {
  tags: ["dev"],
  parameters: {
    docs: {
      source: {
        code: `
<Select options={FRUIT_OPTIONS} label="Favorite fruit" placeholder="Select a fruit…" size="md" />
`.trim(),
      },
    },
  },
  args: {
    options: FRUIT_OPTIONS,
    label: "Favorite fruit",
    placeholder: "Select a fruit…",
    size: "md",
  },
};

export const WithHelperText: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<Select
  options={FRUIT_OPTIONS}
  label="Favorite fruit"
  placeholder="Select a fruit…"
  helperText="We use this to personalize your experience."
/>
`.trim(),
      },
    },
  },
  args: {
    options: FRUIT_OPTIONS,
    label: "Favorite fruit",
    placeholder: "Select a fruit…",
    helperText: "We use this to personalize your experience.",
  },
};

export const WithError: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<Select
  options={FRUIT_OPTIONS}
  label="Favorite fruit"
  placeholder="Select a fruit…"
  error="Please select an option."
/>
`.trim(),
      },
    },
  },
  args: {
    options: FRUIT_OPTIONS,
    label: "Favorite fruit",
    placeholder: "Select a fruit…",
    error: "Please select an option.",
  },
};

export const Required: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<Select
  options={FRUIT_OPTIONS}
  label="Favorite fruit"
  placeholder="Select a fruit…"
  required
  helperText="This field is required."
/>
`.trim(),
      },
    },
  },
  args: {
    options: FRUIT_OPTIONS,
    label: "Favorite fruit",
    placeholder: "Select a fruit…",
    required: true,
    helperText: "This field is required.",
  },
};

export const WithDefaultValue: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<Select options={FRUIT_OPTIONS} label="Favorite fruit" defaultValue="cherry" />
`.trim(),
      },
    },
  },
  args: {
    options: FRUIT_OPTIONS,
    label: "Favorite fruit",
    defaultValue: "cherry",
  },
};

export const Disabled: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<Select
  options={FRUIT_OPTIONS}
  label="Favorite fruit"
  placeholder="Select a fruit…"
  disabled
/>
`.trim(),
      },
    },
  },
  args: {
    options: FRUIT_OPTIONS,
    label: "Favorite fruit",
    placeholder: "Select a fruit…",
    disabled: true,
  },
};

export const AllSizes: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<Select options={FRUIT_OPTIONS} size="sm" label="Small" placeholder="Small select" />
<Select options={FRUIT_OPTIONS} size="md" label="Medium" placeholder="Medium select" />
<Select options={FRUIT_OPTIONS} size="lg" label="Large" placeholder="Large select" />
`.trim(),
      },
    },
  },
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "400px" }}>
      <Select options={FRUIT_OPTIONS} size="sm" label="Small" placeholder="Small select" />
      <Select options={FRUIT_OPTIONS} size="md" label="Medium" placeholder="Medium select" />
      <Select options={FRUIT_OPTIONS} size="lg" label="Large" placeholder="Large select" />
    </div>
  ),
};

export const AllStates: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<Select options={FRUIT_OPTIONS} label="Default" placeholder="Default state" />
<Select options={FRUIT_OPTIONS} label="Required" placeholder="Required state" required />
<Select options={FRUIT_OPTIONS} label="With helper" placeholder="With helper" helperText="This is helper text." />
<Select options={FRUIT_OPTIONS} label="With value" defaultValue="apple" />
<Select options={FRUIT_OPTIONS} label="Error state" placeholder="Error state" error="This field is required." />
<Select options={FRUIT_OPTIONS} label="Disabled" placeholder="Disabled state" disabled />
`.trim(),
      },
    },
  },
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "400px" }}>
      <Select options={FRUIT_OPTIONS} label="Default" placeholder="Default state" />
      <Select options={FRUIT_OPTIONS} label="Required" placeholder="Required state" required />
      <Select options={FRUIT_OPTIONS} label="With helper" placeholder="With helper" helperText="This is helper text." />
      <Select options={FRUIT_OPTIONS} label="With value" defaultValue="apple" />
      <Select options={FRUIT_OPTIONS} label="Error state" placeholder="Error state" error="This field is required." />
      <Select options={FRUIT_OPTIONS} label="Disabled" placeholder="Disabled state" disabled />
    </div>
  ),
};

export const Ghost: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "The `ghost` variant is borderless and label-less — its colour states mirror the ghost Button (transparent → subtle fill on hover/open). Same sizes and functionality as the default select; pass `label` to set the trigger's `aria-label`. Useful as a compact, inline control (e.g. in a toolbar). Shown here over a surface so the hover/open fill reads.",
      },
      source: {
        code: `
<Select options={FRUIT_OPTIONS} variant="ghost" size="sm" defaultValue="apple" label="Sort by" />
<Select options={FRUIT_OPTIONS} variant="ghost" size="md" defaultValue="apple" label="Sort by" />
<Select options={FRUIT_OPTIONS} variant="ghost" size="lg" defaultValue="apple" label="Sort by" />
`.trim(),
      },
    },
  },
  render: () => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        maxWidth: "400px",
        padding: "16px",
        background: "var(--color-surface-subtle)",
        borderRadius: "var(--radius-interactive)",
      }}
    >
      <Select options={FRUIT_OPTIONS} variant="ghost" size="sm" defaultValue="apple" label="Sort by" />
      <Select options={FRUIT_OPTIONS} variant="ghost" size="md" defaultValue="apple" label="Sort by" />
      <Select options={FRUIT_OPTIONS} variant="ghost" size="lg" defaultValue="apple" label="Sort by" />
      <Select options={FRUIT_OPTIONS} variant="ghost" placeholder="Placeholder" label="Filter" />
    </div>
  ),
};
