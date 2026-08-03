import {
  Menu,
  MenuContent,
  MenuGroup,
  MenuGroupLabel,
  MenuItem,
  MenuSeparator,
  MenuTrigger,
} from "@ui-organized/react";
import type { UsageExampleSet } from "./types";

const staged = { layout: "centered" as const, containOverlays: true };

export const menuExamples: UsageExampleSet = {
  grouped: {
    ...staged,
    Do: () => (
      <Menu defaultOpen>
        <MenuTrigger className="btn btn--secondary btn--md">Actions</MenuTrigger>
        <MenuContent>
          <MenuGroup>
            <MenuGroupLabel>Edit</MenuGroupLabel>
            <MenuItem icon="edit">Rename</MenuItem>
            <MenuItem icon="copy">Duplicate</MenuItem>
          </MenuGroup>
          <MenuSeparator />
          <MenuGroup>
            <MenuGroupLabel>Share</MenuGroupLabel>
            <MenuItem icon="mail">Send a copy</MenuItem>
            <MenuItem icon="download">Export</MenuItem>
          </MenuGroup>
        </MenuContent>
      </Menu>
    ),
    Dont: () => (
      <Menu defaultOpen>
        <MenuTrigger className="btn btn--secondary btn--md">Actions</MenuTrigger>
        <MenuContent>
          <MenuItem icon="edit">Rename</MenuItem>
          <MenuItem icon="copy">Duplicate</MenuItem>
          <MenuItem icon="mail">Send a copy</MenuItem>
          <MenuItem icon="download">Export</MenuItem>
          <MenuItem icon="bookmark">Pin to top</MenuItem>
          <MenuItem icon="settings">Settings</MenuItem>
        </MenuContent>
      </Menu>
    ),
  },

  "destructive-last": {
    ...staged,
    Do: () => (
      <Menu defaultOpen>
        <MenuTrigger className="btn btn--secondary btn--md">Actions</MenuTrigger>
        <MenuContent>
          <MenuItem icon="edit">Rename</MenuItem>
          <MenuItem icon="copy">Duplicate</MenuItem>
          <MenuSeparator />
          <MenuItem icon="trash" destructive>
            Delete
          </MenuItem>
        </MenuContent>
      </Menu>
    ),
    // Delete sits between two ordinary items, one slip from either.
    Dont: () => (
      <Menu defaultOpen>
        <MenuTrigger className="btn btn--secondary btn--md">Actions</MenuTrigger>
        <MenuContent>
          <MenuItem icon="edit">Rename</MenuItem>
          <MenuItem icon="trash">Delete</MenuItem>
          <MenuItem icon="copy">Duplicate</MenuItem>
        </MenuContent>
      </Menu>
    ),
  },
};
