import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button, Divider } from "@ui-organized/react";

const meta: Meta<typeof Divider> = {
  title: "Components/Layout/Divider",
  component: Divider,
  tags: ["!dev"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "A thin visual line for separating content or controls.",
      },
    },
  },
  argTypes: {
    orientation: { control: "inline-radio", options: ["horizontal", "vertical"] },
    spacing: { control: "select", options: ["none", "sm", "md", "lg"] },
    labelPosition: { control: "inline-radio", options: ["start", "center", "end"] },
  },
};

export default meta;
type Story = StoryObj<typeof Divider>;

export const Inspect: Story = {
  tags: ["dev"],
  render: (args) => (
    <div style={{ maxWidth: 360, color: "var(--color-content-secondary)" }}>
      <p style={{ margin: 0 }}>Section one</p>
      <Divider {...args} />
      <p style={{ margin: 0 }}>Section two</p>
    </div>
  ),
  args: { orientation: "horizontal", spacing: "md" },
};

export const Horizontal: Story = {
  render: () => (
    <div style={{ maxWidth: 360, color: "var(--color-content-secondary)" }}>
      <p style={{ margin: 0 }}>Section one</p>
      <Divider orientation="horizontal" spacing="md" />
      <p style={{ margin: 0 }}>Section two</p>
    </div>
  ),
};

export const Vertical: Story = {
  render: () => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        height: 24,
        color: "var(--color-content-secondary)",
      }}
    >
      <span>Home</span>
      <Divider orientation="vertical" spacing="md" />
      <span>Docs</span>
      <Divider orientation="vertical" spacing="md" />
      <span>Pricing</span>
    </div>
  ),
};

/**
 * Children make a labelled divider: text or a control between two rules. It is
 * horizontal, and it is not a separator, so the label is read.
 */
export const Labelled: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<Divider spacing="md">or</Divider>
<Divider spacing="md" labelPosition="start">Today</Divider>
<Divider spacing="md" labelPosition="end">Earlier</Divider>
<Divider spacing="md"><Button intent="secondary" size="sm">Show more</Button></Divider>
`.trim(),
      },
    },
  },
  render: () => (
    <div style={{ maxWidth: 360 }}>
      <Divider spacing="md">or</Divider>
      <Divider spacing="md" labelPosition="start">Today</Divider>
      <Divider spacing="md" labelPosition="end">Earlier</Divider>
      <Divider spacing="md">
        <Button intent="secondary" size="sm">Show more</Button>
      </Divider>
    </div>
  ),
};
