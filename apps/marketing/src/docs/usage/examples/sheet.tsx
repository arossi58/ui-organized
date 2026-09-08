import {
  Button,
  Checkbox,
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetTitle,
} from "@ui-organized/react";
import type { UsageExampleSet } from "./types";

const staged = { layout: "centered" as const, containOverlays: true };

const options = {
  display: "flex",
  flexDirection: "column" as const,
  gap: "var(--spacing-space-02)",
  alignItems: "flex-start",
};

export const sheetExamples: UsageExampleSet = {
  side: {
    ...staged,
    // Filters live beside the list they filter, so the panel comes from the side.
    Do: () => (
      <Sheet defaultOpen>
        <SheetContent side="right" size="sm">
          <SheetTitle>Filters</SheetTitle>
          <div style={options}>
            <Checkbox label="Active only" defaultChecked />
            <Checkbox label="Assigned to me" />
            <Checkbox label="Updated this week" />
          </div>
        </SheetContent>
      </Sheet>
    ),
    Dont: () => (
      <Sheet defaultOpen>
        <SheetContent side="bottom" size="sm">
          <SheetTitle>Filters</SheetTitle>
          <div style={options}>
            <Checkbox label="Active only" defaultChecked />
            <Checkbox label="Assigned to me" />
          </div>
        </SheetContent>
      </Sheet>
    ),
  },

  "anchored-action": {
    ...staged,
    Do: () => (
      <Sheet defaultOpen>
        <SheetContent side="right" size="sm">
          <SheetTitle>Filters</SheetTitle>
          <SheetDescription>Applied to the list behind this panel.</SheetDescription>
          <div style={options}>
            <Checkbox label="Active only" defaultChecked />
            <Checkbox label="Assigned to me" />
          </div>
          <SheetFooter>
            <SheetClose className="btn btn--secondary btn--md">Cancel</SheetClose>
            <SheetClose className="btn btn--primary btn--md">Apply</SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    ),
    // The action sits at the end of the content instead of in the footer, so it
    // scrolls away exactly when it is wanted.
    Dont: () => (
      <Sheet defaultOpen>
        <SheetContent side="right" size="sm">
          <SheetTitle>Filters</SheetTitle>
          <SheetDescription>Applied to the list behind this panel.</SheetDescription>
          <div style={options}>
            <Checkbox label="Active only" defaultChecked />
            <Checkbox label="Assigned to me" />
            <Checkbox label="Updated this week" />
            <Checkbox label="Has attachments" />
            <Checkbox label="Archived" />
            <Button intent="primary">Apply</Button>
          </div>
        </SheetContent>
      </Sheet>
    ),
  },
};
