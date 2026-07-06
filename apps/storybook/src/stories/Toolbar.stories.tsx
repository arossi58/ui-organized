import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Toolbar,
  ToolbarGroup,
  Button,
  Input,
  Divider,
} from "@ui-organized/react";

const meta: Meta<typeof Toolbar> = {
  title: "Components/Actions/Toolbar",
  component: Toolbar,
  tags: ["!dev"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          'A layout container that groups related controls. Compose `<Toolbar>` with the library\'s own `Button` (use `intent="ghost"`), `Input`, and `Divider` (use `orientation="vertical"`) components. Match the control `size` across the children to size the toolbar.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Toolbar>;

export const Inspect: Story = {
  tags: ["dev"],
  render: () => (
    <Toolbar>
      <Button intent="ghost">Button</Button>
      <Button intent="ghost">Button</Button>
      <Divider orientation="vertical" />
      <Button intent="ghost">Button</Button>
      <Input placeholder="Data" />
    </Toolbar>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "flex-start" }}>
      <Toolbar>
        <Button intent="ghost" size="lg">Button</Button>
        <Button intent="ghost" size="lg">Button</Button>
        <Divider orientation="vertical" />
        <Button intent="ghost" size="lg">Button</Button>
        <Input size="lg" placeholder="Data" />
      </Toolbar>

      <Toolbar>
        <Button intent="ghost" size="md">Button</Button>
        <Button intent="ghost" size="md">Button</Button>
        <Divider orientation="vertical" />
        <Button intent="ghost" size="md">Button</Button>
        <Input size="md" placeholder="Data" />
      </Toolbar>

      <Toolbar>
        <Button intent="ghost" size="sm">Button</Button>
        <Button intent="ghost" size="sm">Button</Button>
        <Divider orientation="vertical" />
        <Button intent="ghost" size="sm">Button</Button>
        <Input size="sm" placeholder="Data" />
      </Toolbar>
    </div>
  ),
};

export const WithIconButtons: Story = {
  render: () => (
    <Toolbar>
      <ToolbarGroup>
        <Button intent="ghost" icon="copy" aria-label="Copy" />
        <Button intent="ghost" icon="edit" aria-label="Edit" />
      </ToolbarGroup>
      <Divider orientation="vertical" />
      <ToolbarGroup>
        <Button intent="ghost" icon="grid" aria-label="Grid view" />
        <Button intent="ghost" icon="list" aria-label="List view" />
      </ToolbarGroup>
      <Divider orientation="vertical" />
      <Input placeholder="Filter…" />
    </Toolbar>
  ),
};
