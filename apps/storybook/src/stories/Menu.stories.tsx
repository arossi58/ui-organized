import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import {
  Menu,
  MenuTrigger,
  MenuContent,
  MenuItem,
  MenuSeparator,
  MenuGroup,
  MenuGroupLabel,
  MenuRadioGroup,
  MenuRadioItem,
  MenuCheckboxItem,
} from "@ui-organized/react";

const meta: Meta<typeof Menu> = {
  title: "Components/Overlay/Menu",
  component: Menu,
  tags: ["!dev"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A dropdown menu of actions. Compose `<Menu>` with `<MenuTrigger>`, `<MenuContent>`, `<MenuItem>` (optionally `icon` / `destructive`), `<MenuSeparator>`, groups, and checkbox/radio items.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Menu>;

export const Inspect: Story = {
  tags: ["dev"],
  render: function InspectExample() {
    const [showGrid, setShowGrid] = useState(true);
    const [density, setDensity] = useState("comfortable");
    return (
      <Menu>
        <MenuTrigger className="btn btn--secondary btn--md">Actions</MenuTrigger>
        <MenuContent>
          <MenuItem icon="user">Profile</MenuItem>
          <MenuItem icon="settings">Settings</MenuItem>
          <MenuItem icon="copy">Duplicate</MenuItem>
          <MenuSeparator />
          <MenuCheckboxItem checked={showGrid} onCheckedChange={setShowGrid}>
            Show grid
          </MenuCheckboxItem>
          <MenuSeparator />
          <MenuGroup>
            <MenuGroupLabel>Density</MenuGroupLabel>
            <MenuRadioGroup value={density} onValueChange={(v) => setDensity(String(v))}>
              <MenuRadioItem value="comfortable">Comfortable</MenuRadioItem>
              <MenuRadioItem value="compact">Compact</MenuRadioItem>
            </MenuRadioGroup>
          </MenuGroup>
          <MenuSeparator />
          <MenuItem icon="trash" destructive>
            Delete
          </MenuItem>
        </MenuContent>
      </Menu>
    );
  },
};

export const GroupsAndSelection: Story = {
  render: function GroupsExample() {
    const [showGrid, setShowGrid] = useState(true);
    const [density, setDensity] = useState("comfortable");
    return (
      <Menu>
        <MenuTrigger className="btn btn--secondary btn--md">View</MenuTrigger>
        <MenuContent>
          <MenuCheckboxItem checked={showGrid} onCheckedChange={setShowGrid}>
            Show grid
          </MenuCheckboxItem>
          <MenuSeparator />
          <MenuGroup>
            <MenuGroupLabel>Density</MenuGroupLabel>
            <MenuRadioGroup value={density} onValueChange={(v) => setDensity(String(v))}>
              <MenuRadioItem value="comfortable">Comfortable</MenuRadioItem>
              <MenuRadioItem value="compact">Compact</MenuRadioItem>
            </MenuRadioGroup>
          </MenuGroup>
        </MenuContent>
      </Menu>
    );
  },
};
