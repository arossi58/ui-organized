import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Toolbar,
  ToolbarGroup,
  Button,
  Input,
  Divider,
  Menu,
  MenuTrigger,
  MenuContent,
  MenuItem,
  MenuSeparator,
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
          "A layout container that groups related controls. It has no menu of its own: for actions behind a menu, put a `Menu` in the toolbar with a ghost `Button` as its `MenuTrigger` (see With Menus).",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Toolbar>;

export const Inspect: Story = {
  tags: ["dev"],
  render: (args) => (
    <Toolbar {...args}>
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
        <Button intent="ghost" icon="pencil" aria-label="Edit" />
      </ToolbarGroup>
      <Divider orientation="vertical" />
      <ToolbarGroup>
        <Button intent="ghost" icon="grid-2x2" aria-label="Grid view" />
        <Button intent="ghost" icon="list" aria-label="List view" />
      </ToolbarGroup>
      <Divider orientation="vertical" />
      <Input placeholder="Filter…" />
    </Toolbar>
  ),
};

/** Menus are composed, not built in: each is a `Menu` whose trigger is a ghost toolbar button. */
export const WithMenus: Story = {
  render: () => (
    <Toolbar aria-label="Editing tools">
      <Menu>
        <MenuTrigger
          render={
            <Button intent="ghost" size="sm" icon="chevron-down" iconPosition="right">
              File
            </Button>
          }
        />
        <MenuContent>
          <MenuItem icon="file-plus">New</MenuItem>
          <MenuItem icon="folder-open">Open…</MenuItem>
          <MenuSeparator />
          <MenuItem icon="download">Export</MenuItem>
        </MenuContent>
      </Menu>
      <Menu>
        <MenuTrigger
          render={
            <Button intent="ghost" size="sm" icon="chevron-down" iconPosition="right">
              Edit
            </Button>
          }
        />
        <MenuContent>
          <MenuItem icon="undo-2">Undo</MenuItem>
          <MenuItem icon="redo-2">Redo</MenuItem>
          <MenuSeparator />
          <MenuItem icon="copy">Duplicate</MenuItem>
          <MenuItem icon="trash-2" destructive>
            Delete
          </MenuItem>
        </MenuContent>
      </Menu>
      <Menu>
        <MenuTrigger
          render={
            <Button intent="ghost" size="sm" icon="chevron-down" iconPosition="right">
              View
            </Button>
          }
        />
        <MenuContent>
          <MenuItem icon="grid-2x2">Grid</MenuItem>
          <MenuItem icon="list">List</MenuItem>
        </MenuContent>
      </Menu>
      <Divider orientation="vertical" />
      <Button intent="ghost" size="sm" icon="search" aria-label="Search" />
    </Toolbar>
  ),
};
