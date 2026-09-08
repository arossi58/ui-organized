import {
  Button,
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@ui-organized/react";
import type { UsageExampleSet } from "./types";

const staged = { layout: "centered" as const, containOverlays: true };

const target = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "var(--spacing-space-03)",
  width: "15rem",
  padding: "var(--spacing-space-03)",
  border: "1px solid var(--color-border-secondary)",
  borderRadius: "var(--border-radius-04)",
  userSelect: "none" as const,
};

export const contextMenuExamples: UsageExampleSet = {
  "mirrors-visible": {
    ...staged,
    // Everything in the menu is also on the row, so the shortcut is a shortcut.
    Do: () => (
      <ContextMenu defaultOpen>
        <ContextMenuTrigger style={target}>
          <span>Quarterly report</span>
          <Button intent="ghost" size="sm" icon="menu" aria-label="Row actions" />
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem icon="edit">Rename</ContextMenuItem>
          <ContextMenuItem icon="copy">Duplicate</ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem icon="trash" destructive>
            Delete
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    ),
    Dont: () => (
      <ContextMenu defaultOpen>
        <ContextMenuTrigger style={target}>
          <span>Quarterly report</span>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem icon="edit">Rename</ContextMenuItem>
          <ContextMenuItem icon="copy">Duplicate</ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem icon="trash" destructive>
            Delete
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    ),
  },

  scoped: {
    ...staged,
    Do: () => (
      <ContextMenu defaultOpen>
        <ContextMenuTrigger style={target}>
          <span>Quarterly report</span>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem icon="edit">Rename this file</ContextMenuItem>
          <ContextMenuItem icon="download">Download this file</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    ),
    // Half of it has nothing to do with the row that was clicked.
    Dont: () => (
      <ContextMenu defaultOpen>
        <ContextMenuTrigger style={target}>
          <span>Quarterly report</span>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem icon="edit">Rename this file</ContextMenuItem>
          <ContextMenuItem icon="settings">Workspace settings</ContextMenuItem>
          <ContextMenuItem icon="users">Invite a teammate</ContextMenuItem>
          <ContextMenuItem icon="refresh">Reload the page</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    ),
  },
};
