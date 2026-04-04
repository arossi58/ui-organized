import type { Meta, StoryObj } from "@storybook/react";
import { RadioGroup } from "@ds/react";

const PLAN_OPTIONS = [
  { value: "free", label: "Free" },
  { value: "pro", label: "Pro" },
  { value: "team", label: "Team" },
  { value: "enterprise", label: "Enterprise", disabled: true },
];

const meta: Meta<typeof RadioGroup> = {
  title: "Components/RadioGroup",
  component: RadioGroup,
  parameters: {
    layout: "padded",
  },
  argTypes: {
    orientation: {
      control: "select",
      options: ["vertical", "horizontal"],
    },
    label: { control: "text" },
    disabled: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof RadioGroup>;

export const Default: Story = {
  args: {
    options: PLAN_OPTIONS,
    label: "Select a plan",
    defaultValue: "pro",
  },
};

export const Horizontal: Story = {
  args: {
    options: PLAN_OPTIONS,
    label: "Select a plan",
    defaultValue: "free",
    orientation: "horizontal",
  },
};

export const Disabled: Story = {
  args: {
    options: PLAN_OPTIONS,
    label: "Select a plan",
    defaultValue: "pro",
    disabled: true,
  },
};

export const BothOrientations: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      <RadioGroup options={PLAN_OPTIONS} label="Vertical (default)" defaultValue="free" orientation="vertical" />
      <RadioGroup options={PLAN_OPTIONS} label="Horizontal" defaultValue="free" orientation="horizontal" />
    </div>
  ),
};
