import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { SegmentedControl } from "@ui-organized/react";

const VIEW_ITEMS = [
  { value: "list", label: "List" },
  { value: "board", label: "Board" },
  { value: "calendar", label: "Calendar" },
];

const SIZES = ["sm", "md", "lg"] as const;

const meta: Meta<typeof SegmentedControl> = {
  title: "Components/Forms/Segmented Control",
  component: SegmentedControl,
  tags: ["!dev"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "A single-select control that lays out mutually exclusive options in a shared track, with a sliding pill marking the selection. Use `items` for the segments, `size` for density, and `value`/`onValueChange` (or `defaultValue`) to control selection.",
      },
    },
  },
  argTypes: {
    size: { control: "inline-radio", options: SIZES },
    disabled: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof SegmentedControl>;

export const Inspect: Story = {
  tags: ["dev"],
  args: {
    items: VIEW_ITEMS,
    defaultValue: "list",
    size: "md",
    disabled: false,
    "aria-label": "View",
  },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "flex-start" }}>
      {SIZES.map((size) => (
        <SegmentedControl
          key={size}
          size={size}
          items={VIEW_ITEMS}
          defaultValue="list"
          aria-label={`View (${size})`}
        />
      ))}
    </div>
  ),
};

export const TwoUp: Story = {
  render: () => (
    <SegmentedControl
      items={[
        { value: "off", label: "Off" },
        { value: "on", label: "On" },
      ]}
      defaultValue="on"
      aria-label="Power"
    />
  ),
};

export const WithIcons: Story = {
  render: () => (
    <SegmentedControl
      items={[
        { value: "grid", label: "Grid", icon: "grid" },
        { value: "list", label: "List", icon: "list" },
        { value: "settings", label: "Settings", icon: "settings" },
      ]}
      defaultValue="grid"
      aria-label="Layout"
    />
  ),
};

export const ManySegments: Story = {
  render: () => (
    <SegmentedControl
      items={["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => ({ value: d.toLowerCase(), label: d }))}
      defaultValue="wed"
      aria-label="Day"
    />
  ),
};

export const Disabled: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "flex-start" }}>
      <SegmentedControl items={VIEW_ITEMS} defaultValue="list" disabled aria-label="View (disabled)" />
      <SegmentedControl
        items={[
          { value: "list", label: "List" },
          { value: "board", label: "Board" },
          { value: "calendar", label: "Calendar", disabled: true },
        ]}
        defaultValue="list"
        aria-label="View (one disabled)"
      />
    </div>
  ),
};

export const Controlled: Story = {
  render: function ControlledExample() {
    const [value, setValue] = useState("board");
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "flex-start" }}>
        <SegmentedControl items={VIEW_ITEMS} value={value} onValueChange={setValue} aria-label="View" />
        <p style={{ margin: 0, color: "var(--color-content-secondary)" }}>
          Selected: <strong>{value}</strong>
        </p>
      </div>
    );
  },
};
