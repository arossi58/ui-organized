import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Toolbar,
  ToolbarGroup,
  ToolbarButton,
  ToolbarSeparator,
  ToolbarInput,
} from "@ui-organized/react";

const meta: Meta<typeof Toolbar> = {
  title: "Components/Actions/Toolbar",
  component: Toolbar,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A container that groups related controls with roving focus. Compose `<Toolbar>` with `<ToolbarGroup>`, `<ToolbarButton>`, `<ToolbarInput>`, and `<ToolbarSeparator>`.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Toolbar>;

export const Default: Story = {
  render: () => (
    <Toolbar>
      <ToolbarGroup>
        <ToolbarButton icon="copy">Copy</ToolbarButton>
        <ToolbarButton icon="edit">Edit</ToolbarButton>
      </ToolbarGroup>
      <ToolbarSeparator />
      <ToolbarGroup>
        <ToolbarButton icon="grid" aria-label="Grid view" />
        <ToolbarButton icon="list" aria-label="List view" />
      </ToolbarGroup>
      <ToolbarSeparator />
      <ToolbarInput placeholder="Filter…" />
    </Toolbar>
  ),
};
