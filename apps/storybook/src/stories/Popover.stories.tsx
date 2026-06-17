import type { Meta, StoryObj } from "@storybook/react-vite";
import { Popover, PopoverTrigger, PopoverContent } from "@ui-organized/react";

const meta: Meta<typeof Popover> = {
  title: "Components/Overlay/Popover",
  component: Popover,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A floating surface anchored to a trigger. Compose `<Popover>` with `<PopoverTrigger>` and `<PopoverContent>` (which accepts `side`, `align`, `sideOffset`, and `showArrow`).",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Popover>;

export const Default: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger className="btn btn--secondary btn--md">Open popover</PopoverTrigger>
      <PopoverContent showArrow style={{ maxWidth: 260 }}>
        <h4 style={{ margin: "0 0 8px", fontSize: "var(--type-size-body-large)" }}>Dimensions</h4>
        <p
          style={{
            margin: 0,
            color: "var(--color-text-secondary)",
            fontSize: "var(--type-size-body-small)",
          }}
        >
          Set the width and height of the selected layer.
        </p>
      </PopoverContent>
    </Popover>
  ),
};

export const Sides: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 12 }}>
      {(["top", "right", "bottom", "left"] as const).map((side) => (
        <Popover key={side}>
          <PopoverTrigger className="btn btn--secondary btn--md">{side}</PopoverTrigger>
          <PopoverContent side={side} showArrow>
            Positioned on the {side}.
          </PopoverContent>
        </Popover>
      ))}
    </div>
  ),
};
