import type { Meta, StoryObj } from "@storybook/react-vite";
import { Tooltip, TooltipProvider } from "@ui-organized/react";

const meta: Meta<typeof Tooltip> = {
  title: "Components/Overlay/Tooltip",
  component: Tooltip,
  tags: ["!dev"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A short hint shown on hover or focus. Wrap a trigger and pass `content`. Use `side`/`align` for placement and an app-level `<TooltipProvider>` to share open/close delays.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Tooltip>;

export const Inspect: Story = {
  tags: ["dev"],
  render: () => (
    <Tooltip content="Copy to clipboard">
      <button className="btn btn--secondary btn--md">Hover me</button>
    </Tooltip>
  ),
};

export const Sides: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 12 }}>
      {(["top", "right", "bottom", "left"] as const).map((side) => (
        <Tooltip key={side} content={`On the ${side}`} side={side}>
          <button className="btn btn--secondary btn--md">{side}</button>
        </Tooltip>
      ))}
    </div>
  ),
};

export const WithProvider: Story = {
  render: () => (
    <TooltipProvider delay={150} closeDelay={0}>
      <div style={{ display: "flex", gap: 12 }}>
        <Tooltip content="Bold">
          <button className="btn btn--ghost btn--md">B</button>
        </Tooltip>
        <Tooltip content="Italic">
          <button className="btn btn--ghost btn--md">I</button>
        </Tooltip>
        <Tooltip content="Underline">
          <button className="btn btn--ghost btn--md">U</button>
        </Tooltip>
      </div>
    </TooltipProvider>
  ),
};
