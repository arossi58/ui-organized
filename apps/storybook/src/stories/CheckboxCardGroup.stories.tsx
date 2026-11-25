import type { Meta, StoryObj } from "@storybook/react-vite";
import { CheckboxCardGroup } from "@ui-organized/react";

const EXTRAS = [
  { value: "backups", label: "Backups", description: "Nightly, kept for thirty days.", icon: "hard-drive" },
  { value: "support", label: "Priority support", description: "A reply within a working day.", icon: "life-buoy" },
  { value: "audit", label: "Audit log", description: "Every change, who made it and when.", icon: "file-text" },
];

const meta: Meta<typeof CheckboxCardGroup> = {
  title: "Components/Forms/CheckboxCardGroup",
  component: CheckboxCardGroup,
  tags: ["!dev"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Any number of choices from a set of cards, each with a title, an optional description and icon. The whole card is the target.",
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
type Story = StoryObj<typeof CheckboxCardGroup>;

export const Inspect: Story = {
  tags: ["dev"],
  args: { options: EXTRAS, label: "Add-ons", defaultValue: ["backups"], columns: 1, size: "md", indicator: "end" },
  render: (args) => (
    <div style={{ maxWidth: 420 }}>
      <CheckboxCardGroup {...args} />
    </div>
  ),
};

export const Default: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<CheckboxCardGroup
  label="Add-ons"
  defaultValue={["backups", "support"]}
  options={[
    { value: "backups", label: "Backups", description: "Nightly, kept for thirty days.", icon: "hard-drive" },
    { value: "support", label: "Priority support", description: "A reply within a working day.", icon: "life-buoy" },
    { value: "audit", label: "Audit log", description: "Every change, who made it and when.", icon: "file-text" },
  ]}
/>
`.trim(),
      },
    },
  },
  render: () => (
    <div style={{ maxWidth: 420 }}>
      <CheckboxCardGroup label="Add-ons" defaultValue={["backups", "support"]} options={EXTRAS} />
    </div>
  ),
};

/** `columns` lays the cards out in a grid. */
export const Columns: Story = {
  render: () => <CheckboxCardGroup label="Add-ons" defaultValue={["support"]} columns={3} options={EXTRAS} />,
};

/** `size="sm"` with the check box at the start. */
export const CompactAndStart: Story = {
  render: () => (
    <div style={{ maxWidth: 420 }}>
      <CheckboxCardGroup label="Add-ons" size="sm" indicator="start" defaultValue={["audit"]} options={EXTRAS} />
    </div>
  ),
};

/** A disabled option, a disabled group, and an error. */
export const States: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: 420 }}>
      <CheckboxCardGroup
        label="Add-ons"
        defaultValue={["backups"]}
        options={[...EXTRAS.slice(0, 2), { ...EXTRAS[2]!, disabled: true }]}
      />
      <CheckboxCardGroup label="Add-ons" options={EXTRAS.slice(0, 2)} error="Choose at least one add-on." />
      <CheckboxCardGroup label="Add-ons" defaultValue={["support"]} disabled options={EXTRAS.slice(0, 2)} />
    </div>
  ),
};
