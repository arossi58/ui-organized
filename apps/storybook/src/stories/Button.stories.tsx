import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "@ds/react";

const meta: Meta<typeof Button> = {
  title: "Components/Button",
  component: Button,
  parameters: {
    layout: "padded",
  },
  argTypes: {
    intent: {
      control: "select",
      options: ["primary", "secondary", "tertiary", "ghost", "destructive", "destructive-ghost"],
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
    icon: {
      control: "select",
      options: [undefined, "plus", "arrow-right", "download", "trash", "edit", "check", "close"],
    },
    iconPosition: {
      control: "select",
      options: ["left", "right"],
    },
    disabled: { control: "boolean" },
    children: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {
  args: {
    children: "Button",
    intent: "primary",
    size: "md",
  },
};

export const AllIntents: Story = {
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
      <Button intent="primary">Primary</Button>
      <Button intent="secondary">Secondary</Button>
      <Button intent="tertiary">Tertiary</Button>
      <Button intent="ghost">Ghost</Button>
      <Button intent="destructive">Destructive</Button>
      <Button intent="destructive-ghost">Destructive Ghost</Button>
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
};

export const WithIcon: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <Button icon="plus" iconPosition="left">Add item</Button>
        <Button icon="arrow-right" iconPosition="right">Continue</Button>
        <Button intent="secondary" icon="download" iconPosition="left">Download</Button>
        <Button intent="destructive" icon="trash" iconPosition="left">Delete</Button>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <Button size="sm" icon="plus">Small</Button>
        <Button size="md" icon="plus">Medium</Button>
        <Button size="lg" icon="plus">Large</Button>
      </div>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
      <Button intent="primary" disabled>Primary</Button>
      <Button intent="secondary" disabled>Secondary</Button>
      <Button intent="tertiary" disabled>Tertiary</Button>
      <Button intent="ghost" disabled>Ghost</Button>
      <Button intent="destructive" disabled>Destructive</Button>
      <Button intent="destructive-ghost" disabled>Destructive Ghost</Button>
    </div>
  ),
};

export const AllVariantsGrid: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {(["primary", "secondary", "tertiary", "ghost", "destructive", "destructive-ghost"] as const).map((intent) => (
        <div key={intent} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {(["sm", "md", "lg"] as const).map((size) => (
            <Button key={size} intent={intent} size={size}>
              {intent} {size}
            </Button>
          ))}
        </div>
      ))}
    </div>
  ),
};
