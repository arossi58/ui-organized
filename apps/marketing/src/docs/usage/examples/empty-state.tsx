import { Button, EmptyState } from "@ui-organized/react";
import type { UsageExampleSet } from "./types";

export const emptyStateExamples: UsageExampleSet = {
  action: {
    layout: "padded",
    Do: () => (
      <EmptyState
        size="sm"
        icon="users"
        title="No members yet"
        description="Invite people to work on this project with you."
        actions={
          <Button size="sm" icon="plus">
            Invite members
          </Button>
        }
      />
    ),
    Dont: () => <EmptyState size="sm" icon="users" title="Nothing here" />,
  },

  filtered: {
    layout: "padded",
    Do: () => (
      <EmptyState
        size="sm"
        icon="search"
        title="No matching results"
        description="Nothing matches the filters you chose."
        actions={
          <Button size="sm" intent="secondary">
            Clear filters
          </Button>
        }
      />
    ),
    Dont: () => (
      <EmptyState
        size="sm"
        icon="search"
        title="Nothing here yet"
        description="Add your first item to get started."
        actions={
          <Button size="sm" icon="plus">
            Add item
          </Button>
        }
      />
    ),
  },
};
