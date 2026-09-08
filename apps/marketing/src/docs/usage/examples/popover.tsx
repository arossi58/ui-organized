import {
  Button,
  Input,
  Popover,
  PopoverContent,
  PopoverTitle,
  PopoverTrigger,
  Switch,
} from "@ui-organized/react";
import type { UsageExampleSet } from "./types";

const staged = { layout: "centered" as const, containOverlays: true };

const body = {
  display: "flex",
  flexDirection: "column" as const,
  gap: "var(--spacing-space-03)",
  minWidth: "13rem",
};

export const popoverExamples: UsageExampleSet = {
  named: {
    ...staged,
    Do: () => (
      <Popover defaultOpen>
        <PopoverTrigger className="btn btn--secondary btn--md">Display</PopoverTrigger>
        <PopoverContent>
          <PopoverTitle>Display</PopoverTitle>
          <div style={body}>
            <Switch label="Compact rows" defaultChecked />
            <Switch label="Show thumbnails" />
          </div>
        </PopoverContent>
      </Popover>
    ),
    Dont: () => (
      <Popover defaultOpen>
        <PopoverTrigger className="btn btn--secondary btn--md">Display</PopoverTrigger>
        <PopoverContent>
          <div style={body}>
            <Switch label="Compact rows" defaultChecked />
            <Switch label="Show thumbnails" />
          </div>
        </PopoverContent>
      </Popover>
    ),
  },

  scoped: {
    ...staged,
    Do: () => (
      <Popover defaultOpen>
        <PopoverTrigger className="btn btn--secondary btn--md">Rename</PopoverTrigger>
        <PopoverContent>
          <PopoverTitle>Rename</PopoverTitle>
          <div style={body}>
            <Input label="Name" defaultValue="Quarterly report" />
            <Button intent="primary" size="sm">
              Save
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    ),
    // A whole form in a floating box that has to scroll to be filled in.
    Dont: () => (
      <Popover defaultOpen>
        <PopoverTrigger className="btn btn--secondary btn--md">Rename</PopoverTrigger>
        <PopoverContent>
          <PopoverTitle>Details</PopoverTitle>
          <div style={body}>
            <Input label="Name" defaultValue="Quarterly report" />
            <Input label="Owner" defaultValue="Ada Lovelace" />
            <Input label="Reference" placeholder="ABC-123" />
            <Input label="Notes" placeholder="Anything worth knowing" />
            <Button intent="primary" size="sm">
              Save
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    ),
  },
};
