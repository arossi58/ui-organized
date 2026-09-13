import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button, ColorPicker } from "@ui-organized/react";

const BRAND_SWATCHES = [
  "#2563eb",
  "#16a34a",
  "#ca8a04",
  "#dc2626",
  "#7c3aed",
  "#0891b2",
  "#000000",
  "#ffffff",
];

const meta: Meta<typeof ColorPicker> = {
  title: "Components/Forms/ColorPicker",
  component: ColorPicker,
  tags: ["!dev"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "A colour field with a swatch trigger and a portalled picker. The public `value` is a CSS colour string — `#2563eb`, `rgb(37 99 235)` — while the machine works in parsed colour objects; the conversion happens at the component boundary. The alpha checkerboard is overridden with surface tokens so it is correct in dark theme, which Ark's built-in one is not.",
      },
    },
  },
  argTypes: {
    size: { control: "select", options: ["sm", "md", "lg"] },
    variant: { control: "select", options: ["default", "swatch-only"] },
    format: { control: "select", options: ["rgba", "hsla", "hsba", "hex", "oklch"] },
  },
};

export default meta;
type Story = StoryObj<typeof ColorPicker>;

export const Inspect: Story = {
  tags: ["dev"],
  args: {
    label: "Brand colour",
    defaultValue: "#2563eb",
    size: "md",
    variant: "default",
  },
};

export const Open: Story = {
  render: () => (
    <div style={{ minHeight: 380 }}>
      {/* defaultOpen renders the picker surface in place, so the popup is part
          of the captured frame rather than only reachable by clicking. */}
      <ColorPicker label="Brand colour" defaultValue="#2563eb" defaultOpen />
    </div>
  ),
  parameters: {
    docs: {
      source: { code: `<ColorPicker label="Brand colour" defaultValue="#2563eb" defaultOpen />` },
    },
  },
};

export const WithSwatches: Story = {
  render: () => (
    <div style={{ minHeight: 420 }}>
      <ColorPicker
        label="Pick a colour"
        helperText="Or choose one of the brand colours."
        defaultValue="#16a34a"
        swatches={BRAND_SWATCHES}
        defaultOpen
      />
    </div>
  ),
  parameters: {
    docs: {
      source: {
        code: `const BRAND_SWATCHES = ["#2563eb", "#16a34a", "#ca8a04", "#dc2626"];

<ColorPicker
  label="Pick a colour"
  helperText="Or choose one of the brand colours."
  defaultValue="#16a34a"
  swatches={BRAND_SWATCHES}
/>`,
      },
    },
  },
};

export const Controlled: Story = {
  render: function ControlledColorPicker() {
    const [color, setColor] = useState("#7c3aed");
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <ColorPicker label="Accent" value={color} onValueChange={setColor} />
        <code style={{ fontFamily: "var(--type-font-mono, monospace)" }}>{color}</code>
      </div>
    );
  },
  parameters: {
    docs: {
      source: {
        code: `const [color, setColor] = useState("#7c3aed");

<ColorPicker label="Accent" value={color} onValueChange={setColor} />`,
      },
    },
  },
};

export const Formats: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, minHeight: 460 }}>
      {/* The notation select under the sliders switches the fields between HEX,
          RGB, HSL and OKLCH. It is a way of reading the colour, not a property
          of it: whichever notation is showing, this picker still hands back the
          `format` it was given. */}
      <ColorPicker label="Brand colour" defaultValue="#2563eb" format="oklch" defaultOpen />
    </div>
  ),
  parameters: {
    docs: {
      source: {
        code: `<ColorPicker label="Brand colour" defaultValue="#2563eb" format="oklch" />`,
      },
    },
  },
};

export const WithoutFormatInputs: Story = {
  render: () => (
    <div style={{ minHeight: 340 }}>
      <ColorPicker
        label="Brand colour"
        defaultValue="#16a34a"
        showFormatInputs={false}
        defaultOpen
      />
    </div>
  ),
  parameters: {
    docs: {
      source: {
        code: `<ColorPicker label="Brand colour" defaultValue="#16a34a" showFormatInputs={false} />`,
      },
    },
  },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Alongside Buttons, because lining up with them is the point of the
          size ramp: same heights, same padding tokens, same type per size. */}
      {(["sm", "md", "lg"] as const).map((size) => (
        <div key={size} style={{ display: "flex", alignItems: "flex-end", gap: 12 }}>
          <ColorPicker size={size} defaultValue="#2563eb" />
          <ColorPicker size={size} variant="swatch-only" defaultValue="#2563eb" />
          <Button size={size} intent="secondary">
            Button
          </Button>
        </div>
      ))}
    </div>
  ),
  parameters: {
    docs: {
      source: {
        code: `<ColorPicker size="sm" defaultValue="#2563eb" />
<ColorPicker size="md" defaultValue="#2563eb" />
<ColorPicker size="lg" defaultValue="#2563eb" />`,
      },
    },
  },
};

export const SwatchOnly: Story = {
  render: () => (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 12 }}>
      {/* Without the value text the trigger is a square, the side of it the
          shared control height — an icon-only Button by another name. */}
      {(["sm", "md", "lg"] as const).map((size) => (
        <ColorPicker key={size} size={size} variant="swatch-only" defaultValue="#dc2626" />
      ))}
    </div>
  ),
  parameters: {
    docs: {
      source: { code: `<ColorPicker variant="swatch-only" defaultValue="#dc2626" />` },
    },
  },
};
