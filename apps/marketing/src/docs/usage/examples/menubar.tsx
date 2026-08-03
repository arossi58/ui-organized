import { Menu, MenuContent, MenuItem, MenuSeparator, MenuTrigger, Menubar } from "@ui-organized/react";
import type { UsageExampleSet } from "./types";

export const menubarExamples: UsageExampleSet = {
  "stable-categories": {
    Do: () => (
      <Menubar>
        <Menu>
          <MenuTrigger className="menubar__trigger">File</MenuTrigger>
          <MenuContent>
            <MenuItem>New</MenuItem>
            <MenuItem>Open</MenuItem>
            <MenuSeparator />
            <MenuItem>Save</MenuItem>
          </MenuContent>
        </Menu>
        <Menu>
          <MenuTrigger className="menubar__trigger">Edit</MenuTrigger>
          <MenuContent>
            <MenuItem icon="copy">Copy</MenuItem>
            <MenuItem icon="undo">Undo</MenuItem>
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
    // Categories invented for this screen: nothing here can be learned.
    Dont: () => (
      <Menubar>
        <Menu>
          <MenuTrigger className="menubar__trigger">Things</MenuTrigger>
          <MenuContent>
            <MenuItem>New</MenuItem>
          </MenuContent>
        </Menu>
        <Menu>
          <MenuTrigger className="menubar__trigger">More</MenuTrigger>
          <MenuContent>
            <MenuItem icon="copy">Copy</MenuItem>
          </MenuContent>
        </Menu>
        <Menu>
          <MenuTrigger className="menubar__trigger">Other</MenuTrigger>
          <MenuContent>
            <MenuItem icon="grid">Grid</MenuItem>
          </MenuContent>
        </Menu>
      </Menubar>
    ),
  },

  "one-home": {
    Do: () => (
      <Menubar>
        <Menu>
          <MenuTrigger className="menubar__trigger">File</MenuTrigger>
          <MenuContent>
            <MenuItem icon="download">Export</MenuItem>
          </MenuContent>
        </Menu>
        <Menu>
          <MenuTrigger className="menubar__trigger">Edit</MenuTrigger>
          <MenuContent>
            <MenuItem icon="copy">Copy</MenuItem>
          </MenuContent>
        </Menu>
      </Menubar>
    ),
    Dont: () => (
      <Menubar>
        <Menu>
          <MenuTrigger className="menubar__trigger">File</MenuTrigger>
          <MenuContent>
            <MenuItem icon="download">Export</MenuItem>
          </MenuContent>
        </Menu>
        <Menu>
          <MenuTrigger className="menubar__trigger">Edit</MenuTrigger>
          <MenuContent>
            <MenuItem icon="copy">Copy</MenuItem>
            <MenuItem icon="download">Export</MenuItem>
          </MenuContent>
        </Menu>
      </Menubar>
    ),
  },
};
