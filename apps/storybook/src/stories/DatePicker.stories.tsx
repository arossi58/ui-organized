import type { Meta, StoryObj } from "@storybook/react-vite";
import { DatePicker } from "@ui-organized/react";

const meta: Meta<typeof DatePicker> = {
  title: "Components/Forms/DatePicker",
  component: DatePicker,
  tags: ["!dev"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "An input with a portalled calendar, built on Ark's date-picker machine. Values are ISO date strings (`YYYY-MM-DD`) at the public API; the machine works in parsed calendar dates.\n\nThis is **additive**. `DateInput`, `DateTimeInput` and `DateRangeInput` are unchanged and still the right choice for typed entry — `DatePicker` is the calendar-first option, and the two share a visual vocabulary.",
      },
    },
  },
  argTypes: {
    size: { control: "select", options: ["sm", "md", "lg"] },
    variant: { control: "select", options: ["default", "ghost"] },
    selectionMode: { control: "select", options: ["single", "multiple", "range"] },
  },
};

export default meta;
type Story = StoryObj<typeof DatePicker>;

export const Inspect: Story = {
  tags: ["dev"],
  args: {
    label: "Start date",
    defaultValue: ["2026-03-14"],
    size: "md",
    variant: "default",
    selectionMode: "single",
  },
};

export const Open: Story = {
  render: () => (
    <div style={{ minHeight: 420 }}>
      {/* A fixed defaultValue keeps the rendered month deterministic — a picker
          seeded from today would make every snapshot differ. */}
      <DatePicker label="Start date" defaultValue={["2026-03-14"]} defaultOpen />
    </div>
  ),
  parameters: {
    docs: {
      source: { code: `<DatePicker label="Start date" defaultValue={["2026-03-14"]} defaultOpen />` },
    },
  },
};

export const Range: Story = {
  render: () => (
    <div style={{ minHeight: 420 }}>
      <DatePicker
        label="Trip dates"
        selectionMode="range"
        defaultValue={["2026-03-10", "2026-03-18"]}
        defaultOpen
      />
    </div>
  ),
  parameters: {
    docs: {
      source: {
        code: `<DatePicker
  label="Trip dates"
  selectionMode="range"
  defaultValue={["2026-03-10", "2026-03-18"]}
/>`,
      },
    },
  },
};

export const WithBounds: Story = {
  render: () => (
    <div style={{ minHeight: 420 }}>
      <DatePicker
        label="Delivery date"
        helperText="Within the next two weeks."
        defaultValue={["2026-03-14"]}
        min="2026-03-09"
        max="2026-03-23"
        defaultOpen
      />
    </div>
  ),
  parameters: {
    docs: {
      source: {
        code: `<DatePicker
  label="Delivery date"
  helperText="Within the next two weeks."
  min="2026-03-09"
  max="2026-03-23"
/>`,
      },
    },
  },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <DatePicker label="Small" size="sm" defaultValue={["2026-03-14"]} />
      <DatePicker label="Medium" size="md" defaultValue={["2026-03-14"]} />
      <DatePicker label="Large" size="lg" defaultValue={["2026-03-14"]} />
    </div>
  ),
  parameters: {
    docs: {
      source: {
        code: `<DatePicker label="Small"  size="sm" defaultValue={["2026-03-14"]} />
<DatePicker label="Medium" size="md" defaultValue={["2026-03-14"]} />
<DatePicker label="Large"  size="lg" defaultValue={["2026-03-14"]} />`,
      },
    },
  },
};
