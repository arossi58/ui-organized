import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuGroup,
  ContextMenuGroupLabel,
} from "@ui-organized/react";

const meta: Meta<typeof ContextMenu> = {
  title: "Components/Overlay/ContextMenu",
  component: ContextMenu,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A menu that opens at the cursor on right-click (or long-press). Compose `<ContextMenu>` with `<ContextMenuTrigger>` (the target area) and `<ContextMenuContent>` of items.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof ContextMenu>;

export const Default: Story = {
  render: () => (
    <ContextMenu>
      <ContextMenuTrigger
        style={{
          display: "grid",
          placeItems: "center",
          width: 280,
          height: 140,
          border: "1px dashed var(--color-border-primary)",
          borderRadius: 8,
          color: "var(--color-text-text-tertiary)",
          userSelect: "none",
        }}
      >
        Right-click here
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuGroup>
          <ContextMenuGroupLabel>Actions</ContextMenuGroupLabel>
          <ContextMenuItem icon="copy">Copy</ContextMenuItem>
          <ContextMenuItem icon="edit">Rename</ContextMenuItem>
          <ContextMenuItem icon="download">Download</ContextMenuItem>
        </ContextMenuGroup>
        <ContextMenuSeparator />
        <ContextMenuItem icon="trash" destructive>
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  ),
};
