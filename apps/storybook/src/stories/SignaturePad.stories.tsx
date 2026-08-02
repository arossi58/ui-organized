import type { Meta, StoryObj } from "@storybook/react-vite";
import { SignaturePad } from "@ui-organized/react";

/**
 * A fixed pair of stroke paths.
 *
 * Hardcoded rather than drawn, so the rendered frame is identical on every run —
 * a pad seeded by interaction would make each snapshot differ.
 */
const SAMPLE_PATHS = [
  "M 40 80 C 50 40, 70 40, 80 70 C 90 100, 110 100, 120 60",
  "M 130 75 C 150 45, 175 85, 200 55",
];

const meta: Meta<typeof SignaturePad> = {
  title: "Components/Forms/SignaturePad",
  component: SignaturePad,
  tags: ["!dev"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "A pad that records a signature as SVG stroke paths. The hidden input submits those paths — lossless and resolution independent. When a server wants a PNG instead, `onDrawEnd` hands you a `getDataUrl` to rasterise with.\n\nInk width is a canvas stroke in device pixels, so it is a prop rather than CSS; the ink's colour is themed.",
      },
    },
  },
  argTypes: {
    size: { control: "select", options: ["sm", "md", "lg"] },
    variant: { control: "select", options: ["default", "bordered"] },
    strokeWidth: { control: { type: "range", min: 1, max: 8 } },
  },
};

export default meta;
type Story = StoryObj<typeof SignaturePad>;

export const Inspect: Story = {
  tags: ["dev"],
  args: {
    label: "Signature",
    defaultPaths: SAMPLE_PATHS,
    size: "md",
    variant: "default",
  },
};

export const Bordered: Story = {
  render: () => (
    <SignaturePad
      label="Sign here"
      helperText="Use your mouse, or your finger on a touchscreen."
      variant="bordered"
      defaultPaths={SAMPLE_PATHS}
    />
  ),
  parameters: {
    docs: {
      source: {
        code: `<SignaturePad
  label="Sign here"
  helperText="Use your mouse, or your finger on a touchscreen."
  variant="bordered"
/>`,
      },
    },
  },
};

export const Empty: Story = {
  render: () => <SignaturePad label="Signature" helperText="Sign above the line." />,
  parameters: {
    docs: {
      source: { code: `<SignaturePad label="Signature" helperText="Sign above the line." />` },
    },
  },
};

export const ThickInk: Story = {
  render: () => (
    <SignaturePad label="Signature" strokeWidth={5} defaultPaths={SAMPLE_PATHS} />
  ),
  parameters: {
    docs: {
      source: { code: `<SignaturePad label="Signature" strokeWidth={5} />` },
    },
  },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <SignaturePad label="Small" size="sm" defaultPaths={SAMPLE_PATHS} showClear={false} />
      <SignaturePad label="Medium" size="md" defaultPaths={SAMPLE_PATHS} showClear={false} />
      <SignaturePad label="Large" size="lg" defaultPaths={SAMPLE_PATHS} showClear={false} />
    </div>
  ),
  parameters: {
    docs: {
      source: {
        code: `<SignaturePad label="Small"  size="sm" />
<SignaturePad label="Medium" size="md" />
<SignaturePad label="Large"  size="lg" />`,
      },
    },
  },
};
