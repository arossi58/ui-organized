import {
  Button,
  Divider,
  Menu,
  MenuContent,
  MenuItem,
  MenuSeparator,
  MenuTrigger,
  Toolbar,
  ToolbarGroup,
} from "@ui-organized/react";
import type { UsageExampleSet } from "./types";

/** A ghost toolbar button with a chevron, used as a menu's trigger. */
const menuButton = (label: string) => (
  <Button intent="ghost" size="sm" icon="chevron-down" iconPosition="right">
    {label}
  </Button>
);

export const toolbarExamples: UsageExampleSet = {
  "matched-size": {
    Do: () => (
      <Toolbar>
        <Button intent="ghost" size="sm" icon="copy" aria-label="Copy" />
        <Button intent="ghost" size="sm" icon="pencil" aria-label="Edit" />
        <Button intent="ghost" size="sm" icon="trash-2" aria-label="Delete" />
      </Toolbar>
    ),
    Dont: () => (
      <Toolbar>
        <Button intent="ghost" size="lg" icon="copy" aria-label="Copy" />
        <Button intent="ghost" size="sm" icon="pencil" aria-label="Edit" />
        <Button intent="ghost" size="md" icon="trash-2" aria-label="Delete" />
      </Toolbar>
    ),
  },

  grouping: {
    Do: () => (
      <Toolbar>
        <ToolbarGroup>
          <Button intent="ghost" size="sm" icon="undo-2" aria-label="Undo" />
          <Button intent="ghost" size="sm" icon="redo-2" aria-label="Redo" />
        </ToolbarGroup>
        <Divider orientation="vertical" />
        <ToolbarGroup>
          <Button intent="ghost" size="sm" icon="list" aria-label="List view" />
          <Button intent="ghost" size="sm" icon="grid-2x2" aria-label="Grid view" />
        </ToolbarGroup>
      </Toolbar>
    ),
    Dont: () => (
      <Toolbar>
        <Button intent="ghost" size="sm" icon="undo-2" aria-label="Undo" />
        <Button intent="ghost" size="sm" icon="redo-2" aria-label="Redo" />
        <Button intent="ghost" size="sm" icon="list" aria-label="List view" />
        <Button intent="ghost" size="sm" icon="grid-2x2" aria-label="Grid view" />
      </Toolbar>
    ),
  },

  menus: {
    layout: "centered",
    containOverlays: true,
    // Occasional actions sit one click away, grouped and named, behind toolbar buttons.
    Do: () => (
      <Toolbar aria-label="Editing tools">
        <Menu>
          <MenuTrigger render={menuButton("File")} />
          <MenuContent>
            <MenuItem icon="file-plus">New</MenuItem>
            <MenuItem icon="download">Export</MenuItem>
          </MenuContent>
        </Menu>
        <Menu defaultOpen>
          <MenuTrigger render={menuButton("Edit")} />
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
        <Divider orientation="vertical" />
        <Button intent="ghost" size="sm" icon="search" aria-label="Search" />
      </Toolbar>
    ),
    // Every occasional action on permanent show: eight unlabeled icons to decode.
    Dont: () => (
      <Toolbar aria-label="Editing tools">
        <Button intent="ghost" size="sm" icon="file-plus" aria-label="New" />
        <Button intent="ghost" size="sm" icon="download" aria-label="Export" />
        <Button intent="ghost" size="sm" icon="undo-2" aria-label="Undo" />
        <Button intent="ghost" size="sm" icon="redo-2" aria-label="Redo" />
        <Button intent="ghost" size="sm" icon="copy" aria-label="Duplicate" />
        <Button intent="ghost" size="sm" icon="trash-2" aria-label="Delete" />
        <Button intent="ghost" size="sm" icon="search" aria-label="Search" />
      </Toolbar>
    ),
  },

  ghost: {
    Do: () => (
      <Toolbar>
        <Button intent="ghost" size="sm">
          Filter
        </Button>
        <Button intent="ghost" size="sm">
          Sort
        </Button>
        <Button intent="ghost" size="sm">
          Export
        </Button>
      </Toolbar>
    ),
    Dont: () => (
      <Toolbar>
        <Button intent="primary" size="sm">
          Filter
        </Button>
        <Button intent="primary" size="sm">
          Sort
        </Button>
        <Button intent="primary" size="sm">
          Export
        </Button>
      </Toolbar>
    ),
  },
};
