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
          "A horizontal bar of menus.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Menubar>;

export const Inspect: Story = {
  tags: ["dev"],
  // Args go on the Menubar — it's the documented component here, so it's what
  // the docs panel's controls describe. The three Menus keep their own state.
  render: (args) => (
    <Menubar {...args}>
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
          <MenuItem icon="pencil">Find &amp; replace</MenuItem>
        </MenuContent>
      </Menu>
      <Menu>
        <MenuTrigger className="menubar__trigger">View</MenuTrigger>
        <MenuContent>
          <MenuItem icon="grid-2x2">Grid</MenuItem>
          <MenuItem icon="list">List</MenuItem>
        </MenuContent>
      </Menu>
    </Menubar>
  ),
};
