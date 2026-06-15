import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Range } from "@ui-organized/react";

const meta: Meta<typeof Range> = {
  title: "Components/Range",
  component: Range,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Range is a slider for picking a numeric value; configure it with `min` / `max` / `step` (or `snapValues` for uneven stops), `value` / `defaultValue` and `onValueChange` for state, `size`, and display options like `rangeLabels`, `hideValue`, and `formatValue`.",
      },
    },
  },
  argTypes: {
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
    label: { control: "text" },
    min: { control: "number" },
    max: { control: "number" },
    step: { control: "number" },
    rangeLabels: { control: "boolean" },
    hideValue: { control: "boolean" },
    disabled: { control: "boolean" },
    error: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof Range>;

const wrap = { display: "flex", flexDirection: "column" as const, gap: "24px", maxWidth: "320px" };

export const Default: Story = {
  args: {
    label: "Volume",
    defaultValue: 40,
    size: "md",
  },
};

export const WithRangeLabels: Story = {
  args: {
    label: "Brightness",
    defaultValue: 60,
    rangeLabels: true,
  },
};

export const AllSizes: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<Range size="sm" label="Small" defaultValue={30} rangeLabels />
<Range size="md" label="Medium" defaultValue={50} rangeLabels />
<Range size="lg" label="Large" defaultValue={70} rangeLabels />
`.trim(),
      },
    },
  },
  render: () => (
    <div style={wrap}>
      <Range size="sm" label="Small" defaultValue={30} rangeLabels />
      <Range size="md" label="Medium" defaultValue={50} rangeLabels />
      <Range size="lg" label="Large" defaultValue={70} rangeLabels />
    </div>
  ),
};

export const States: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<Range label="Default" defaultValue={50} rangeLabels />
<Range label="Disabled" defaultValue={50} rangeLabels disabled />
<Range label="Error" defaultValue={50} rangeLabels error="Please pick a lower value." />
`.trim(),
      },
    },
  },
  render: () => (
    <div style={wrap}>
      <Range label="Default" defaultValue={50} rangeLabels />
      <Range label="Disabled" defaultValue={50} rangeLabels disabled />
      <Range label="Error" defaultValue={50} rangeLabels error="Please pick a lower value." />
    </div>
  ),
};

/** `step` snaps the thumb at regular intervals between min and max. */
export const SnapAtIntervals: Story = {
  args: {
    label: "Rating (steps of 10)",
    min: 0,
    max: 100,
    step: 10,
    defaultValue: 30,
    rangeLabels: true,
  },
};

/** `snapValues` snaps to a fixed, possibly uneven, set of allowed values. */
export const SnapToValues: Story = {
  parameters: {
    docs: {
      source: {
        code: `
const sizes = [8, 16, 24, 32, 48, 64];

<Range
  label="Font size"
  snapValues={sizes}
  defaultValue={16}
  rangeLabels
  startLabel="8px"
  endLabel="64px"
  formatValue={(v) => v + "px"}
/>
`.trim(),
      },
    },
  },
  render: () => {
    const sizes = [8, 16, 24, 32, 48, 64];
    return (
      <div style={wrap}>
        <Range
          label="Font size"
          snapValues={sizes}
          defaultValue={16}
          rangeLabels
          startLabel="8px"
          endLabel="64px"
          formatValue={(v) => `${v}px`}
        />
      </div>
    );
  },
};

export const Controlled: Story = {
  parameters: {
    docs: {
      source: {
        code: `
const [value, setValue] = useState(25);

<Range
  label="Opacity"
  value={value}
  onValueChange={setValue}
  rangeLabels
  formatValue={(v) => v + "%"}
/>
`.trim(),
      },
    },
  },
  render: () => {
    const [value, setValue] = useState(25);
    return (
      <div style={wrap}>
        <Range
          label="Opacity"
          value={value}
          onValueChange={setValue}
          rangeLabels
          formatValue={(v) => `${v}%`}
        />
        <div style={{ display: "flex", gap: "8px" }}>
          {[0, 25, 50, 75, 100].map((v) => (
            <button key={v} type="button" onClick={() => setValue(v)}>
              {v}%
            </button>
          ))}
        </div>
      </div>
    );
  },
};
