import type { Meta, StoryObj } from "@storybook/react-vite";
import { Alert } from "@ui-organized/react";
import { useState } from "react";

const meta: Meta<typeof Alert> = {
  title: "Components/Alert",
  component: Alert,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Alerts surface contextual feedback. Use `variant` to set the tone (info, success, warning, error), `title` for an optional heading, and `onDismiss` to render a dismiss button.",
      },
    },
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["info", "success", "warning", "error"],
    },
    title: { control: "text" },
    children: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof Alert>;

export const Default: Story = {
  args: {
    variant: "info",
    title: "Heads up",
    children: "This is an informational alert message.",
  },
};

export const AllVariants: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<Alert variant="info" title="Information">
  This is an informational alert. Use it to provide neutral guidance.
</Alert>
<Alert variant="success" title="Success">
  Your changes have been saved successfully.
</Alert>
<Alert variant="warning" title="Warning">
  This action may have unintended side effects. Proceed with caution.
</Alert>
<Alert variant="error" title="Error">
  Something went wrong. Please try again or contact support.
</Alert>
`.trim(),
      },
    },
  },
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxWidth: "520px" }}>
      <Alert variant="info" title="Information">
        This is an informational alert. Use it to provide neutral guidance.
      </Alert>
      <Alert variant="success" title="Success">
        Your changes have been saved successfully.
      </Alert>
      <Alert variant="warning" title="Warning">
        This action may have unintended side effects. Proceed with caution.
      </Alert>
      <Alert variant="error" title="Error">
        Something went wrong. Please try again or contact support.
      </Alert>
    </div>
  ),
};

export const WithoutTitle: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<Alert variant="info">Informational message without a title.</Alert>
<Alert variant="success">Your file was uploaded successfully.</Alert>
<Alert variant="warning">Your session is about to expire.</Alert>
<Alert variant="error">Failed to load data. Refresh the page.</Alert>
`.trim(),
      },
    },
  },
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxWidth: "520px" }}>
      <Alert variant="info">Informational message without a title.</Alert>
      <Alert variant="success">Your file was uploaded successfully.</Alert>
      <Alert variant="warning">Your session is about to expire.</Alert>
      <Alert variant="error">Failed to load data. Refresh the page.</Alert>
    </div>
  ),
};

export const Dismissible: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<Alert
  variant="info"
  title="Dismissible alert"
  onDismiss={() => setVisible(false)}
>
  Click the dismiss button to hide this alert.
</Alert>
`.trim(),
      },
    },
  },
  render: () => {
    const [visible, setVisible] = useState(true);
    return visible ? (
      <div style={{ maxWidth: "520px" }}>
        <Alert
          variant="info"
          title="Dismissible alert"
          onDismiss={() => setVisible(false)}
        >
          Click the dismiss button to hide this alert.
        </Alert>
      </div>
    ) : (
      <p style={{ color: "var(--color-text-text-tertiary)" }}>Alert was dismissed.</p>
    );
  },
};

export const AllVariantsDismissible: Story = {
  parameters: {
    docs: {
      source: {
        code: `
{variants.filter((v) => !dismissed[v]).map((variant) => (
  <Alert
    key={variant}
    variant={variant}
    title={variant.charAt(0).toUpperCase() + variant.slice(1) + " alert"}
    onDismiss={() => setDismissed((prev) => ({ ...prev, [variant]: true }))}
  >
    This is a dismissible {variant} alert.
  </Alert>
))}
`.trim(),
      },
    },
  },
  render: () => {
    const [dismissed, setDismissed] = useState<Record<string, boolean>>({});
    const variants = ["info", "success", "warning", "error"] as const;
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxWidth: "520px" }}>
        {variants.filter((v) => !dismissed[v]).map((variant) => (
          <Alert
            key={variant}
            variant={variant}
            title={`${variant.charAt(0).toUpperCase() + variant.slice(1)} alert`}
            onDismiss={() => setDismissed((prev) => ({ ...prev, [variant]: true }))}
          >
            This is a dismissible {variant} alert.
          </Alert>
        ))}
        {variants.every((v) => dismissed[v]) && (
          <p style={{ color: "var(--color-text-text-tertiary)" }}>All alerts dismissed.</p>
        )}
      </div>
    );
  },
};
