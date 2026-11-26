import type { Meta, StoryObj } from "@storybook/react-vite";
import { RadioCardGroup } from "@ui-organized/react";

const PLANS = [
  { value: "starter", label: "Starter", description: "For one person getting started.", icon: "user" },
  { value: "team", label: "Team", description: "Shared workspaces, roles and reviews.", icon: "users" },
  { value: "company", label: "Company", description: "Single sign-on and audit history.", icon: "building-2" },
];

const meta: Meta<typeof RadioCardGroup> = {
  title: "Components/Forms/RadioCardGroup",
  component: RadioCardGroup,
  tags: ["!dev"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "A single choice from a set of cards, each with a title, an optional description and icon. The whole card is the target.",
      },
    },
  },
  argTypes: {
    columns: { control: "select", options: [1, 2, 3, 4] },
    size: { control: "inline-radio", options: ["sm", "md"] },
    indicator: { control: "inline-radio", options: ["start", "end"] },
    label: { control: "text" },
    disabled: { control: "boolean" },
    error: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof RadioCardGroup>;

export const Inspect: Story = {
  tags: ["dev"],
  args: { options: PLANS, label: "Plan", defaultValue: "team", columns: 1, size: "md", indicator: "end" },
  render: (args) => (
    <div style={{ maxWidth: 420 }}>
      <RadioCardGroup {...args} />
    </div>
  ),
};

export const Default: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<RadioCardGroup
  label="Plan"
  defaultValue="team"
  options={[
    { value: "starter", label: "Starter", description: "For one person getting started.", icon: "user" },
    { value: "team", label: "Team", description: "Shared workspaces, roles and reviews.", icon: "users" },
    { value: "company", label: "Company", description: "Single sign-on and audit history.", icon: "building-2" },
  ]}
/>
`.trim(),
      },
    },
  },
  render: () => (
    <div style={{ maxWidth: 420 }}>
      <RadioCardGroup label="Plan" defaultValue="team" options={PLANS} />
    </div>
  ),
};

/** `columns` lays the cards out in a grid. */
export const Columns: Story = {
  render: () => <RadioCardGroup label="Plan" defaultValue="starter" columns={3} options={PLANS} />,
};

/** `size="sm"`, the indicator at the start, and cards without icons or descriptions. */
export const CompactAndStart: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: 420 }}>
      <RadioCardGroup label="Plan" size="sm" defaultValue="team" options={PLANS} />
      <RadioCardGroup
        label="Delivery"
        indicator="start"
        columns={2}
        defaultValue="standard"
        options={[
          { value: "standard", label: "Standard", description: "Three to five days." },
          { value: "express", label: "Express", description: "Next working day." },
        ]}
      />
    </div>
  ),
};

/** A disabled option, a disabled group, and an error. */
export const States: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: 420 }}>
      <RadioCardGroup
        label="Plan"
        defaultValue="starter"
        options={[...PLANS.slice(0, 2), { ...PLANS[2]!, disabled: true }]}
      />
      <RadioCardGroup label="Plan" options={PLANS.slice(0, 2)} error="Choose a plan to continue." />
      <RadioCardGroup label="Plan" defaultValue="team" disabled options={PLANS.slice(0, 2)} />
    </div>
  ),
};
