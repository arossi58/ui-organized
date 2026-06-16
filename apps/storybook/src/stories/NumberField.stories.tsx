import type { Meta, StoryObj } from "@storybook/react-vite";
import { NumberField } from "@ui-organized/react";

const meta: Meta<typeof NumberField> = {
  title: "Components/Forms/NumberField",
  component: NumberField,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "A numeric input with increment/decrement steppers. Supports `min`/`max`/`step`, `Intl.NumberFormat` via `format`, and the shared field chrome (label, helper text, error).",
      },
    },
  },
  argTypes: {
    size: { control: "select", options: ["sm", "md", "lg"] },
    disabled: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof NumberField>;

export const Default: Story = {
  render: (args) => (
    <div style={{ width: 240 }}>
      <NumberField {...args} />
    </div>
  ),
  args: { label: "Quantity", defaultValue: 1, min: 0, helperText: "Between 0 and 100", max: 100 },
};

export const Currency: Story = {
  render: () => (
    <div style={{ width: 240 }}>
      <NumberField
        label="Price"
        defaultValue={19.99}
        step={0.01}
        min={0}
        format={{ style: "currency", currency: "USD" }}
      />
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, width: 240 }}>
      <NumberField label="Small" size="sm" defaultValue={2} />
      <NumberField label="Medium" size="md" defaultValue={2} />
      <NumberField label="Large" size="lg" defaultValue={2} />
    </div>
  ),
};

export const WithError: Story = {
  render: () => (
    <div style={{ width: 240 }}>
      <NumberField label="Age" defaultValue={0} min={18} error="Must be 18 or older" />
    </div>
  ),
};
