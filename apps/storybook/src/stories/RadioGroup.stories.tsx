import type { Meta, StoryObj } from "@storybook/react-vite";
import { RadioGroup } from "@ui-organized/react";

const PLAN_OPTIONS = [
  { value: "free", label: "Free" },
  { value: "pro", label: "Pro" },
  { value: "team", label: "Team" },
  { value: "enterprise", label: "Enterprise", disabled: true },
];

const meta: Meta<typeof RadioGroup> = {
  title: "Components/Forms/RadioGroup",
  component: RadioGroup,
  tags: ["!dev"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "RadioGroup lets the user pick one option from a set; pass `options` (each with `value`, `label`, and optional `disabled`), a group `label`, `defaultValue` / `value` for selection, and `orientation` to lay items out vertically or horizontally.",
      },
    },
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

export const Inspect: Story = {
  tags: ["dev"],
  parameters: {
    docs: {
      source: {
        code: `
<RadioGroup options={PLAN_OPTIONS} label="Select a plan" defaultValue="pro" />
`.trim(),
      },
    },
  },
  args: {
    options: PLAN_OPTIONS,
    label: "Select a plan",
    defaultValue: "pro",
  },
};

export const Horizontal: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<RadioGroup options={PLAN_OPTIONS} label="Select a plan" defaultValue="free" orientation="horizontal" />
`.trim(),
      },
    },
  },
  args: {
    options: PLAN_OPTIONS,
    label: "Select a plan",
    defaultValue: "free",
    orientation: "horizontal",
  },
};

export const Disabled: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<RadioGroup options={PLAN_OPTIONS} label="Select a plan" defaultValue="pro" disabled />
`.trim(),
      },
    },
  },
  args: {
    options: PLAN_OPTIONS,
    label: "Select a plan",
    defaultValue: "pro",
    disabled: true,
  },
};

export const BothOrientations: Story = {
  parameters: {
    docs: {
      source: {
        code: `
const options = [
  { value: "free", label: "Free" },
  { value: "pro", label: "Pro" },
  { value: "team", label: "Team" },
  { value: "enterprise", label: "Enterprise", disabled: true },
];

<RadioGroup options={options} label="Vertical (default)" defaultValue="free" orientation="vertical" />
<RadioGroup options={options} label="Horizontal" defaultValue="free" orientation="horizontal" />
`.trim(),
      },
    },
  },
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      <RadioGroup options={PLAN_OPTIONS} label="Vertical (default)" defaultValue="free" orientation="vertical" />
      <RadioGroup options={PLAN_OPTIONS} label="Horizontal" defaultValue="free" orientation="horizontal" />
    </div>
  ),
};
