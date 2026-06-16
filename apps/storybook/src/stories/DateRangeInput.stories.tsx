import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { DateRangeInput, type DateRangeValue } from "@ui-organized/react";

const meta: Meta<typeof DateRangeInput> = {
  title: "Components/Forms/DateRangeInput",
  component: DateRangeInput,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "A from–to date range built from two native `<input type=\"date\">` controls on the Input field surface, under one shared `label`, `helperText`, and `error`. On desktop the calendar buttons open one shared design-system two-month range calendar; on touch devices they defer to the OS-native picker. The two ends auto-constrain each other (the end can't precede the start) on top of the optional `min` / `max` bounds. Works controlled (`value` + `onChange`) or uncontrolled (`defaultValue`).",
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
type Story = StoryObj<typeof DateRangeInput>;

export const Default: Story = {
  args: {
    label: "Date range",
    size: "md",
  },
};

export const WithValue: Story = {
  args: {
    label: "Trip dates",
    defaultValue: { start: "2026-06-15", end: "2026-06-22" },
  },
};

export const Required: Story = {
  args: {
    label: "Booking window",
    required: true,
  },
};

export const WithHelperText: Story = {
  args: {
    label: "Reporting period",
    helperText: "Pick the first and last day to include.",
  },
};

export const WithError: Story = {
  args: {
    label: "Date range",
    error: "End date must be on or after the start date.",
  },
};

export const Bounded: Story = {
  args: {
    label: "Date range (2026 only)",
    min: "2026-01-01",
    max: "2026-12-31",
    defaultValue: { start: "2026-06-01", end: "2026-06-30" },
    helperText: "Only dates within 2026 can be selected.",
  },
};

export const AllSizes: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<DateRangeInput size="sm" label="Small" defaultValue={{ start: "2026-06-15", end: "2026-06-22" }} />
<DateRangeInput size="md" label="Medium" defaultValue={{ start: "2026-06-15", end: "2026-06-22" }} />
<DateRangeInput size="lg" label="Large" defaultValue={{ start: "2026-06-15", end: "2026-06-22" }} />
`.trim(),
      },
    },
  },
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "480px" }}>
      <DateRangeInput size="sm" label="Small" defaultValue={{ start: "2026-06-15", end: "2026-06-22" }} />
      <DateRangeInput size="md" label="Medium" defaultValue={{ start: "2026-06-15", end: "2026-06-22" }} />
      <DateRangeInput size="lg" label="Large" defaultValue={{ start: "2026-06-15", end: "2026-06-22" }} />
    </div>
  ),
};

export const AllStates: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<DateRangeInput label="Default" />
<DateRangeInput label="With value" defaultValue={{ start: "2026-06-15", end: "2026-06-22" }} />
<DateRangeInput label="Required" required />
<DateRangeInput label="Error state" error="End date must be on or after the start date." />
<DateRangeInput label="Disabled" defaultValue={{ start: "2026-06-15", end: "2026-06-22" }} disabled />
`.trim(),
      },
    },
  },
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "480px" }}>
      <DateRangeInput label="Default" />
      <DateRangeInput label="With value" defaultValue={{ start: "2026-06-15", end: "2026-06-22" }} />
      <DateRangeInput label="Required" required />
      <DateRangeInput label="Error state" error="End date must be on or after the start date." />
      <DateRangeInput label="Disabled" defaultValue={{ start: "2026-06-15", end: "2026-06-22" }} disabled />
    </div>
  ),
};

/** Controlled range with a live nights count derived from the two ends. */
export const Controlled: Story = {
  parameters: {
    docs: {
      source: {
        code: `
const [range, setRange] = useState<DateRangeValue>({ start: "", end: "" });
const nights =
  range.start && range.end
    ? Math.round(
        (new Date(range.end).getTime() - new Date(range.start).getTime()) / 86_400_000,
      )
    : null;

<DateRangeInput
  label="Stay dates"
  value={range}
  onChange={setRange}
  helperText={nights != null ? nights + " night(s)" : "Pick your check-in and check-out."}
/>
`.trim(),
      },
    },
  },
  render: () => {
    const [range, setRange] = useState<DateRangeValue>({ start: "", end: "" });
    const nights =
      range.start && range.end
        ? Math.round(
            (new Date(range.end).getTime() - new Date(range.start).getTime()) / 86_400_000,
          )
        : null;
    return (
      <div style={{ maxWidth: "480px" }}>
        <DateRangeInput
          label="Stay dates"
          value={range}
          onChange={setRange}
          helperText={
            nights != null ? `${nights} night(s)` : "Pick your check-in and check-out."
          }
        />
      </div>
    );
  },
};
