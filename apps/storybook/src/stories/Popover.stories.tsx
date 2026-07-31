import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverTitle,
  PopoverDescription,
} from "@ui-organized/react";

const meta: Meta<typeof Popover> = {
  title: "Components/Overlay/Popover",
  component: Popover,
  tags: ["!dev"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A floating surface anchored to a trigger. Compose `<Popover>` with `<PopoverTrigger>` and `<PopoverContent>` (which accepts `side`, `align`, and `sideOffset`). The content is a dialog, so name it — with a `<PopoverTitle>`, or `aria-label` when it has no heading.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Popover>;

export const Inspect: Story = {
  tags: ["dev"],
  render: (args) => (
    <Popover {...args}>
      <PopoverTrigger className="btn btn--secondary btn--md">Open popover</PopoverTrigger>
      <PopoverContent style={{ maxWidth: 260 }}>
        <PopoverTitle>Dimensions</PopoverTitle>
        <PopoverDescription>Set the width and height of the selected layer.</PopoverDescription>
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
          {/* No heading here, so the dialog is named by `aria-label` instead. */}
          <PopoverContent side={side} aria-label={`Positioned on the ${side}`}>
            Positioned on the {side}.
          </PopoverContent>
        </Popover>
      ))}
    </div>
  ),
};
