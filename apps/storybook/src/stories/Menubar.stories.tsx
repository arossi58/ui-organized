import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Menubar,
  Menu,
  MenuTrigger,
  MenuContent,
  MenuItem,
  MenuSeparator,
} from "@ui-organized/react";

const meta: Meta<typeof Menubar> = {
  title: "Components/Navigation/Menubar",
  component: Menubar,
  tags: ["!dev"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A horizontal bar of menus (File / Edit / View …). Place one `<Menu>` per entry inside `<Menubar>` and style each `<MenuTrigger>` with the `menubar__trigger` class.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Menubar>;

export const Inspect: Story = {
  tags: ["dev"],
  render: () => (
    <Menubar>
      <Menu>
        <MenuTrigger className="menubar__trigger">File</MenuTrigger>
        <MenuContent>
          <MenuItem>New file</MenuItem>
          <MenuItem>Open…</MenuItem>
          <MenuSeparator />
          <MenuItem>Save</MenuItem>
        </MenuContent>
      </Menu>
      <Menu>
        <MenuTrigger className="menubar__trigger">Edit</MenuTrigger>
        <MenuContent>
          <MenuItem icon="copy">Copy</MenuItem>
          <MenuItem icon="edit">Find &amp; replace</MenuItem>
        </MenuContent>
      </Menu>
      <Menu>
        <MenuTrigger className="menubar__trigger">View</MenuTrigger>
        <MenuContent>
          <MenuItem icon="grid">Grid</MenuItem>
          <MenuItem icon="list">List</MenuItem>
        </MenuContent>
      </Menu>
    </Menubar>
  ),
};
