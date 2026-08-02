import type { Meta, StoryObj } from "@storybook/react-vite";
import { Steps } from "@ui-organized/react";

const CHECKOUT_STEPS = [
  { title: "Cart", description: "Review items", content: "Three items in your cart." },
  { title: "Shipping", description: "Where to send it", content: "Pick a delivery address." },
  { title: "Payment", description: "How to pay", content: "Choose a payment method." },
];

const meta: Meta<typeof Steps> = {
  title: "Components/Navigation/Steps",
  component: Steps,
  tags: ["!dev"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Progress through a linear task — checkout, onboarding, a multi-part form. `count` is derived from `steps`, never passed, so the indicator row and the progress state can never disagree. Set `linear` to stop people jumping ahead.",
      },
    },
  },
  argTypes: {
    orientation: { control: "select", options: ["horizontal", "vertical"] },
    size: { control: "select", options: ["sm", "md", "lg"] },
    variant: { control: "select", options: ["numbered", "dotted"] },
  },
};

export default meta;
type Story = StoryObj<typeof Steps>;

export const Inspect: Story = {
  tags: ["dev"],
  args: {
    steps: CHECKOUT_STEPS,
    defaultStep: 1,
    orientation: "horizontal",
    size: "md",
    variant: "numbered",
  },
};

export const Vertical: Story = {
  render: () => (
    <div style={{ maxWidth: 360 }}>
      <Steps steps={CHECKOUT_STEPS} orientation="vertical" defaultStep={1} />
    </div>
  ),
  parameters: {
    docs: {
      source: {
        code: `<Steps steps={CHECKOUT_STEPS} orientation="vertical" defaultStep={1} />`,
      },
    },
  },
};

export const Dotted: Story = {
  render: () => (
    <Steps steps={CHECKOUT_STEPS} variant="dotted" defaultStep={2} showContent={false} />
  ),
  parameters: {
    docs: {
      source: {
        code: `{/* showContent={false} leaves just the tracker, for a form that owns its own panels. */}
<Steps steps={CHECKOUT_STEPS} variant="dotted" defaultStep={2} showContent={false} />`,
      },
    },
  },
};

export const Linear: Story = {
  render: () => (
    <Steps
      steps={CHECKOUT_STEPS}
      linear
      completedContent="All done — thanks for your order."
    />
  ),
  parameters: {
    docs: {
      source: {
        code: `{/* linear stops a step being reached before the ones before it are complete. */}
<Steps
  steps={CHECKOUT_STEPS}
  linear
  completedContent="All done — thanks for your order."
/>`,
      },
    },
  },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      <Steps steps={CHECKOUT_STEPS} size="sm" defaultStep={1} showContent={false} />
      <Steps steps={CHECKOUT_STEPS} size="md" defaultStep={1} showContent={false} />
      <Steps steps={CHECKOUT_STEPS} size="lg" defaultStep={1} showContent={false} />
    </div>
  ),
  parameters: {
    docs: {
      source: {
        code: `<Steps steps={CHECKOUT_STEPS} size="sm" defaultStep={1} showContent={false} />
<Steps steps={CHECKOUT_STEPS} size="md" defaultStep={1} showContent={false} />
<Steps steps={CHECKOUT_STEPS} size="lg" defaultStep={1} showContent={false} />`,
      },
    },
  },
};
