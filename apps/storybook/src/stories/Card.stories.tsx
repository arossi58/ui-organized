import type { Meta, StoryObj } from "@storybook/react-vite";
import { Card, CardHeader, CardBody, CardFooter, Button, Badge } from "@ui-organized/react";

const meta: Meta<typeof Card> = {
  title: "Components/Card",
  component: Card,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Cards group related content in a surface. Compose `<Card>` with `<CardHeader>`, `<CardBody>`, and `<CardFooter>`, and use `variant` for emphasis and `padding` for density.",
      },
    },
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
  parameters: {
    docs: {
      source: {
        code: `
<Card variant="default" padding="md">
  <CardHeader>
    <strong>Card title</strong>
  </CardHeader>
  <CardBody>
    <p>This is the card body content. It can contain any content you need.</p>
  </CardBody>
  <CardFooter>
    <Button size="sm">Action</Button>
  </CardFooter>
</Card>
`.trim(),
      },
    },
  },
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
  parameters: {
    docs: {
      source: {
        code: `
<Card variant="default">
  <CardHeader>
    <strong>default</strong>
  </CardHeader>
  <CardBody>
    <p>Card with default variant.</p>
  </CardBody>
</Card>
<Card variant="outlined">
  <CardHeader>
    <strong>outlined</strong>
  </CardHeader>
  <CardBody>
    <p>Card with outlined variant.</p>
  </CardBody>
</Card>
<Card variant="elevated">
  <CardHeader>
    <strong>elevated</strong>
  </CardHeader>
  <CardBody>
    <p>Card with elevated variant.</p>
  </CardBody>
</Card>
`.trim(),
      },
    },
  },
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
  parameters: {
    docs: {
      source: {
        code: `
<Card variant="outlined" padding="none">
  <CardBody>
    <p>padding="none"</p>
  </CardBody>
</Card>
<Card variant="outlined" padding="sm">
  <CardBody>
    <p>padding="sm"</p>
  </CardBody>
</Card>
<Card variant="outlined" padding="md">
  <CardBody>
    <p>padding="md"</p>
  </CardBody>
</Card>
<Card variant="outlined" padding="lg">
  <CardBody>
    <p>padding="lg"</p>
  </CardBody>
</Card>
`.trim(),
      },
    },
  },
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
  parameters: {
    docs: {
      source: {
        code: `
<Card>
  <CardHeader>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <strong>Subscription</strong>
      <Badge variant="success" size="sm">Active</Badge>
    </div>
  </CardHeader>
  <CardBody>
    <p>You are on the Pro plan. Your next billing date is January 1, 2026.</p>
  </CardBody>
  <CardFooter>
    <div style={{ display: "flex", gap: "8px" }}>
      <Button intent="secondary" size="sm">Cancel plan</Button>
      <Button size="sm">Upgrade</Button>
    </div>
  </CardFooter>
</Card>
`.trim(),
      },
    },
  },
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
