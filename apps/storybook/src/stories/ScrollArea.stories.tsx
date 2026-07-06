import type { Meta, StoryObj } from "@storybook/react-vite";
import { ScrollArea } from "@ui-organized/react";

const meta: Meta<typeof ScrollArea> = {
  title: "Components/Layout/ScrollArea",
  component: ScrollArea,
  tags: ["!dev"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "A scrollable container with a themed scrollbar. Give the Root a bounded height via `style`/`className` so its content can overflow.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof ScrollArea>;

export const Inspect: Story = {
  tags: ["dev"],
  render: () => (
    <ScrollArea
      style={{ height: 200, width: 280, border: "1px solid var(--color-border-secondary)", borderRadius: 8 }}
    >
      <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 8 }}>
        {Array.from({ length: 30 }, (_, i) => (
          <div key={i}>Item {i + 1}</div>
        ))}
      </div>
    </ScrollArea>
  ),
};

export const Both: Story = {
  render: () => (
    <ScrollArea
      orientation="both"
      style={{ height: 200, width: 280, border: "1px solid var(--color-border-secondary)", borderRadius: 8 }}
    >
      <div style={{ padding: 16, width: 600 }}>
        {Array.from({ length: 20 }, (_, i) => (
          <p key={i} style={{ whiteSpace: "nowrap", margin: "0 0 8px" }}>
            Row {i + 1} — this line is wider than the viewport to force horizontal scrolling.
          </p>
        ))}
      </div>
    </ScrollArea>
  ),
};
