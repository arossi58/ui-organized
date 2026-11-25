import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Button, Calendar, type DateRangeValue } from "@ui-organized/react";

/**
 * Every story anchors its view on a fixed month, so the baselines do not move
 * as the days pass. Named presets resolve against today, so the stories pick a
 * value none of them matches, and none is pressed whatever the date.
 */
const NAMED_PRESETS = [
  { label: "Today", value: "today" },
  { label: "Yesterday", value: "yesterday" },
  { label: "Last 7 days", value: "last7Days" },
  { label: "Last 30 days", value: "last30Days" },
  { label: "This month", value: "thisMonth" },
  { label: "Last month", value: "lastMonth" },
] as const;

const meta: Meta<typeof Calendar> = {
  title: "Components/Forms/Calendar",
  component: Calendar,
  tags: ["!dev"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "A month grid on its own, for one day or a range, with optional presets and a footer. Values are ISO `YYYY-MM-DD` strings.",
      },
    },
  },
  argTypes: {
    variant: { control: "inline-radio", options: ["plain", "card"] },
    numMonths: { control: "select", options: [1, 2] },
  },
};

export default meta;
type Story = StoryObj<typeof Calendar>;

export const Inspect: Story = {
  tags: ["dev"],
  args: { defaultValue: "2026-03-18", variant: "card", numMonths: 1 },
};

/** One day. */
export const Single: Story = {
  parameters: {
    docs: { source: { code: `<Calendar defaultValue="2026-03-18" />` } },
  },
  render: () => <Calendar defaultValue="2026-03-18" variant="card" />,
};

/** A start and an end, across two months. */
export const Range: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Calendar mode="range" numMonths={2} defaultValue={{ start: "2026-03-09", end: "2026-04-02" }} />`,
      },
    },
  },
  render: () => (
    <Calendar mode="range" numMonths={2} variant="card" defaultValue={{ start: "2026-03-09", end: "2026-04-02" }} />
  ),
};

/** Presets in a column before the grid. A named preset is resolved against today. */
export const WithPresets: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<Calendar
  mode="range"
  variant="card"
  presets={[
    { label: "Today", value: "today" },
    { label: "Last 7 days", value: "last7Days" },
    { label: "This month", value: "thisMonth" },
    { label: "Spring break", value: { start: "2026-03-09", end: "2026-03-13" } },
  ]}
/>
`.trim(),
      },
    },
  },
  render: () => (
    <Calendar
      mode="range"
      variant="card"
      presets={[...NAMED_PRESETS]}
      defaultValue={{ start: "2026-03-02", end: "2026-03-04" }}
    />
  ),
};

/** A footer row for actions: here, Apply commits a draft range. */
export const WithFooter: Story = {
  render: function Render() {
    const [draft, setDraft] = useState<DateRangeValue>({ start: "2026-03-09", end: "2026-03-13" });
    return (
      <Calendar
        mode="range"
        variant="card"
        value={draft}
        onValueChange={setDraft}
        footer={
          <>
            <Button intent="secondary" size="sm">Cancel</Button>
            <Button intent="primary" size="sm" disabled={!draft.end}>Apply</Button>
          </>
        }
      />
    );
  },
};
