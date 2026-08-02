import type { Meta, StoryObj } from "@storybook/react-vite";
import { AngleSlider } from "@ui-organized/react";

const CARDINAL_MARKERS = [0, 90, 180, 270];

const meta: Meta<typeof AngleSlider> = {
  title: "Components/Forms/AngleSlider",
  component: AngleSlider,
  tags: ["!dev"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "A dial for picking a rotation in degrees — gradient angles, image rotation, compass bearings. Values wrap at 360, which is what makes it a dial rather than a `Range`: there is no start and no end.",
      },
    },
  },
  argTypes: {
    size: { control: "select", options: ["sm", "md", "lg"] },
    step: { control: { type: "number" } },
  },
};

export default meta;
type Story = StoryObj<typeof AngleSlider>;

export const Inspect: Story = {
  tags: ["dev"],
  args: {
    label: "Gradient angle",
    defaultValue: 45,
    showValue: true,
    size: "md",
  },
};

export const WithMarkers: Story = {
  render: () => (
    <AngleSlider
      label="Bearing"
      defaultValue={135}
      markers={CARDINAL_MARKERS}
      showValue
    />
  ),
  parameters: {
    docs: {
      source: {
        code: `const CARDINAL_MARKERS = [0, 90, 180, 270];

<AngleSlider
  label="Bearing"
  defaultValue={135}
  markers={CARDINAL_MARKERS}
  showValue
/>`,
      },
    },
  },
};

export const SnapTo15Degrees: Story = {
  render: () => (
    <AngleSlider
      label="Rotation"
      helperText="Arrow keys move in 15° steps."
      defaultValue={90}
      step={15}
      showValue
    />
  ),
  parameters: {
    docs: {
      source: {
        code: `<AngleSlider
  label="Rotation"
  helperText="Arrow keys move in 15° steps."
  defaultValue={90}
  step={15}
  showValue
/>`,
      },
    },
  },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 32 }}>
      <AngleSlider label="Small" size="sm" defaultValue={45} />
      <AngleSlider label="Medium" size="md" defaultValue={45} />
      <AngleSlider label="Large" size="lg" defaultValue={45} />
    </div>
  ),
  parameters: {
    docs: {
      source: {
        code: `<AngleSlider label="Small"  size="sm" defaultValue={45} />
<AngleSlider label="Medium" size="md" defaultValue={45} />
<AngleSlider label="Large"  size="lg" defaultValue={45} />`,
      },
    },
  },
};

export const Disabled: Story = {
  render: () => <AngleSlider label="Locked angle" defaultValue={210} showValue disabled />,
  parameters: {
    docs: {
      source: {
        code: `<AngleSlider label="Locked angle" defaultValue={210} showValue disabled />`,
      },
    },
  },
};
