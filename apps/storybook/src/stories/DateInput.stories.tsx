import type { Meta, StoryObj } from "@storybook/react-vite";
import { DateInput } from "@ui-organized/react";

const meta: Meta<typeof DateInput> = {
  title: "Components/Forms/DateInput",
  component: DateInput,
  tags: ["!dev"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "A date field built on `Input` — a native `<input type=\"date\">` on the field surface with a leading calendar button. On desktop the button opens a design-system calendar popover; on touch devices it defers to the OS-native picker. Accepts native `value` / `min` / `max` (ISO `YYYY-MM-DD`) alongside the shared `label`, `helperText`, `error`, `size`, and `required` / `disabled` props.",
      },
    },
  },
  argTypes: {
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
    label: { control: "text" },
    helperText: { control: "text" },
    error: { control: "text" },
    min: { control: "text" },
    max: { control: "text" },
    disabled: { control: "boolean" },
    required: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof DateInput>;

export const Inspect: Story = {
  tags: ["dev"],
  args: {
    label: "Date",
    size: "md",
  },
};

export const WithValue: Story = {
  args: {
    label: "Start date",
    defaultValue: "2026-06-15",
  },
};

export const Required: Story = {
  args: {
    label: "Date of birth",
    required: true,
  },
};

export const WithHelperText: Story = {
  args: {
    label: "Appointment date",
    helperText: "Bookings open up to 30 days in advance.",
  },
};

export const WithError: Story = {
  args: {
    label: "Date",
    error: "Please choose a date.",
  },
};

export const WithMinMax: Story = {
  args: {
    label: "Date (June 2026 only)",
    min: "2026-06-01",
    max: "2026-06-30",
    helperText: "Only dates in June 2026 can be selected.",
  },
};

export const AllSizes: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<DateInput size="sm" label="Small" />
<DateInput size="md" label="Medium" />
<DateInput size="lg" label="Large" />
`.trim(),
      },
    },
  },
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "400px" }}>
      <DateInput size="sm" label="Small" />
      <DateInput size="md" label="Medium" />
      <DateInput size="lg" label="Large" />
    </div>
  ),
};

export const AllStates: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<DateInput label="Default" />
<DateInput label="With value" defaultValue="2026-06-15" />
<DateInput label="Required" required />
<DateInput label="With helper" helperText="Bookings open 30 days ahead." />
<DateInput label="Error state" error="Please choose a date." />
<DateInput label="Disabled" defaultValue="2026-06-15" disabled />
`.trim(),
      },
    },
  },
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "400px" }}>
      <DateInput label="Default" />
      <DateInput label="With value" defaultValue="2026-06-15" />
      <DateInput label="Required" required />
      <DateInput label="With helper" helperText="Bookings open 30 days ahead." />
      <DateInput label="Error state" error="Please choose a date." />
      <DateInput label="Disabled" defaultValue="2026-06-15" disabled />
    </div>
  ),
};
