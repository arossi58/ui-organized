import type { Meta, StoryObj } from "@storybook/react";
import { Card, CardHeader, CardBody, CardFooter, Button, Badge } from "@ds/react";

const meta: Meta<typeof Card> = {
  title: "Components/Card",
  component: Card,
  parameters: {
    layout: "padded",
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "outlined", "elevated"],
    },
    padding: {
      control: "select",
      options: ["none", "sm", "md", "lg"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  render: (args) => (
    <Card {...args} style={{ maxWidth: "380px" }}>
      <CardHeader>
        <strong>Card title</strong>
      </CardHeader>
      <CardBody>
        <p style={{ margin: 0, color: "var(--color-text-text-secondary)", fontSize: "var(--type-size-body-medium)" }}>
          This is the card body content. It can contain any content you need.
        </p>
      </CardBody>
      <CardFooter>
        <Button size="sm">Action</Button>
      </CardFooter>
    </Card>
  ),
  args: {
    variant: "default",
    padding: "md",
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "flex-start" }}>
      {(["default", "outlined", "elevated"] as const).map((variant) => (
        <Card key={variant} variant={variant} style={{ width: "240px" }}>
          <CardHeader>
            <strong>{variant}</strong>
          </CardHeader>
          <CardBody>
            <p style={{ margin: 0, color: "var(--color-text-text-secondary)", fontSize: "var(--type-size-body-medium)" }}>
              Card with {variant} variant.
            </p>
          </CardBody>
        </Card>
      ))}
    </div>
  ),
};

export const AllPaddingSizes: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "flex-start" }}>
      {(["none", "sm", "md", "lg"] as const).map((padding) => (
        <Card key={padding} variant="outlined" padding={padding} style={{ width: "200px" }}>
          <CardBody>
            <p style={{ margin: 0, color: "var(--color-text-text-secondary)", fontSize: "var(--type-size-body-small)" }}>
              padding="{padding}"
            </p>
          </CardBody>
        </Card>
      ))}
    </div>
  ),
};

export const RichContent: Story = {
  render: () => (
    <Card style={{ maxWidth: "380px" }}>
      <CardHeader>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <strong>Subscription</strong>
          <Badge variant="success" size="sm">Active</Badge>
        </div>
      </CardHeader>
      <CardBody>
        <p style={{ margin: "0 0 12px", color: "var(--color-text-text-secondary)", fontSize: "var(--type-size-body-medium)" }}>
          You are on the Pro plan. Your next billing date is January 1, 2026.
        </p>
      </CardBody>
      <CardFooter>
        <div style={{ display: "flex", gap: "8px" }}>
          <Button intent="secondary" size="sm">Cancel plan</Button>
          <Button size="sm">Upgrade</Button>
        </div>
      </CardFooter>
    </Card>
  ),
};
