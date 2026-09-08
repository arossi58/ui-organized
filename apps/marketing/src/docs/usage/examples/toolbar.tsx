import { Button, Divider, Toolbar, ToolbarGroup } from "@ui-organized/react";
import type { UsageExampleSet } from "./types";

export const toolbarExamples: UsageExampleSet = {
  "matched-size": {
    Do: () => (
      <Toolbar>
        <Button intent="ghost" size="sm" icon="copy" aria-label="Copy" />
        <Button intent="ghost" size="sm" icon="edit" aria-label="Edit" />
        <Button intent="ghost" size="sm" icon="trash" aria-label="Delete" />
      </Toolbar>
    ),
    Dont: () => (
      <Toolbar>
        <Button intent="ghost" size="lg" icon="copy" aria-label="Copy" />
        <Button intent="ghost" size="sm" icon="edit" aria-label="Edit" />
        <Button intent="ghost" size="md" icon="trash" aria-label="Delete" />
      </Toolbar>
    ),
  },

  grouping: {
    Do: () => (
      <Toolbar>
        <ToolbarGroup>
          <Button intent="ghost" size="sm" icon="undo" aria-label="Undo" />
          <Button intent="ghost" size="sm" icon="redo" aria-label="Redo" />
        </ToolbarGroup>
        <Divider orientation="vertical" />
        <ToolbarGroup>
          <Button intent="ghost" size="sm" icon="list" aria-label="List view" />
          <Button intent="ghost" size="sm" icon="grid" aria-label="Grid view" />
        </ToolbarGroup>
      </Toolbar>
    ),
    Dont: () => (
      <Toolbar>
        <Button intent="ghost" size="sm" icon="undo" aria-label="Undo" />
        <Button intent="ghost" size="sm" icon="redo" aria-label="Redo" />
        <Button intent="ghost" size="sm" icon="list" aria-label="List view" />
        <Button intent="ghost" size="sm" icon="grid" aria-label="Grid view" />
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
