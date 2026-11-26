import type { Meta, StoryObj } from "@storybook/react-vite";
import { Card, CardBody, Meter, Stat } from "@ui-organized/react";

const meta: Meta<typeof Stat> = {
  title: "Components/Data Display/Stat",
  component: Stat,
  tags: ["!dev"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "One number and what it means: a label, the value, and how it has moved. The delta's colour follows the trend unless `sentiment` says otherwise.",
      },
    },
  },
  argTypes: {
    trend: { control: "inline-radio", options: [undefined, "up", "down", "flat"] },
    sentiment: { control: "inline-radio", options: [undefined, "positive", "negative", "neutral"] },
    variant: { control: "inline-radio", options: ["card", "plain"] },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
  },
};

export default meta;
type Story = StoryObj<typeof Stat>;

export const Inspect: Story = {
  tags: ["dev"],
  args: {
    label: "Revenue",
    value: "$48,260",
    delta: "+12.4%",
    trend: "up",
    description: "vs last month",
    variant: "card",
    size: "md",
  },
  render: (args) => (
    <div style={{ maxWidth: 280 }}>
      <Stat {...args} />
    </div>
  ),
};

export const Default: Story = {
  render: () => (
    <div style={{ maxWidth: 280 }}>
      <Stat label="Revenue" value="$48,260" delta="+12.4%" trend="up" description="vs last month" />
    </div>
  ),
};

/** Up, down and flat. The arrow is decoration; a screen reader hears the direction written out. */
export const Trends: Story = {
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 220px))", gap: 16 }}>
      <Stat
        label="Active users"
        value="8,412"
        delta="+6.2%"
        trend="up"
        description="vs last week"
      />
      <Stat label="Orders" value="862" delta="-2.3%" trend="down" description="vs last week" />
      <Stat label="Uptime" value="99.98%" delta="0%" trend="flat" description="vs last week" />
    </div>
  ),
};

/** Where up is bad news, set `sentiment` so the colour tells the truth. */
export const Sentiment: Story = {
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 220px))", gap: 16 }}>
      <Stat
        label="Refund rate"
        value="1.8%"
        delta="+0.2%"
        trend="up"
        sentiment="negative"
        description="vs last month"
      />
      <Stat
        label="Response time"
        value="184 ms"
        delta="-22 ms"
        trend="down"
        sentiment="positive"
        description="vs last month"
      />
    </div>
  ),
};

/** `chart` takes a small chart under the numbers, here a Meter. */
export const WithChart: Story = {
  render: () => (
    <div style={{ maxWidth: 280 }}>
      <Stat
        label="Storage"
        value="72 GB"
        delta="+4 GB"
        trend="up"
        sentiment="neutral"
        description="of 100 GB"
        chart={<Meter value={72} size="sm" aria-label="Storage used" />}
      />
    </div>
  ),
};

/** `plain` drops the frame, for a row of stats inside one card. */
export const Plain: Story = {
  render: () => (
    <Card style={{ maxWidth: 720 }}>
      <CardBody>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 24 }}>
          <Stat variant="plain" label="Revenue" value="$48,260" delta="+12.4%" trend="up" />
          <Stat variant="plain" label="Customers" value="1,204" delta="+4.1%" trend="up" />
          <Stat variant="plain" label="Orders" value="862" delta="-2.3%" trend="down" />
        </div>
      </CardBody>
    </Card>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
      {(["sm", "md", "lg"] as const).map((size) => (
        <div key={size} style={{ width: 240 }}>
          <Stat
            size={size}
            label="Revenue"
            value="$48,260"
            delta="+12.4%"
            trend="up"
            description="vs last month"
          />
        </div>
      ))}
    </div>
  ),
};
