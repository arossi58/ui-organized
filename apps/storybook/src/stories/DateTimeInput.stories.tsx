import type { Meta, StoryObj } from "@storybook/react-vite";
import { DateTimeInput } from "@ui-organized/react";

const meta: Meta<typeof DateTimeInput> = {
  title: "Components/DateTimeInput",
  component: DateTimeInput,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "A date-and-time field built on `Input` — a native `<input type=\"datetime-local\">` on the field surface with a leading calendar button. On desktop the button opens a design-system calendar popover with a time field; on touch devices it defers to the OS-native picker. Accepts native `value` / `min` / `max` / `step` (ISO `YYYY-MM-DDTHH:mm`) alongside the shared `label`, `helperText`, `error`, `size`, and `required` / `disabled` props.",
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
type Story = StoryObj<typeof DateTimeInput>;

export const Default: Story = {
  args: {
    label: "Date and time",
    size: "md",
  },
};

export const WithValue: Story = {
  args: {
    label: "Starts at",
    defaultValue: "2026-06-15T09:30",
  },
};

export const Required: Story = {
  args: {
    label: "Meeting time",
    required: true,
  },
};

export const WithHelperText: Story = {
  args: {
    label: "Reminder",
    helperText: "We'll notify you at this local date and time.",
  },
};

export const WithError: Story = {
  args: {
    label: "Date and time",
    error: "Please choose a date and time.",
  },
};

export const FifteenMinuteSteps: Story = {
  args: {
    label: "Appointment slot",
    step: 900,
    defaultValue: "2026-06-15T09:00",
    helperText: "Slots are available on the quarter hour.",
  },
};

export const AllSizes: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<DateTimeInput size="sm" label="Small" />
<DateTimeInput size="md" label="Medium" />
<DateTimeInput size="lg" label="Large" />
`.trim(),
      },
    },
  },
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "400px" }}>
      <DateTimeInput size="sm" label="Small" />
      <DateTimeInput size="md" label="Medium" />
      <DateTimeInput size="lg" label="Large" />
    </div>
  ),
};

export const AllStates: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<DateTimeInput label="Default" />
<DateTimeInput label="With value" defaultValue="2026-06-15T09:30" />
<DateTimeInput label="Required" required />
<DateTimeInput label="With helper" helperText="Local date and time." />
<DateTimeInput label="Error state" error="Please choose a date and time." />
<DateTimeInput label="Disabled" defaultValue="2026-06-15T09:30" disabled />
`.trim(),
      },
    },
  },
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "400px" }}>
      <DateTimeInput label="Default" />
      <DateTimeInput label="With value" defaultValue="2026-06-15T09:30" />
      <DateTimeInput label="Required" required />
      <DateTimeInput label="With helper" helperText="Local date and time." />
      <DateTimeInput label="Error state" error="Please choose a date and time." />
      <DateTimeInput label="Disabled" defaultValue="2026-06-15T09:30" disabled />
    </div>
  ),
};
