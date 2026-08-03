import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@ui-organized/react";
import type { UsageExampleSet } from "./types";

/**
 * Every pair opens by default and contains its overlay, so both halves are
 * visible side by side rather than one click away.
 */
const staged = { layout: "centered" as const, containOverlays: true };

export const dialogExamples: UsageExampleSet = {
  titled: {
    ...staged,
    Do: () => (
      <Dialog defaultOpen>
        <DialogContent size="sm" showClose={false}>
          <DialogTitle>Rename project</DialogTitle>
          <DialogDescription>The new name appears everywhere the old one did.</DialogDescription>
          <DialogFooter>
            <DialogClose className="btn btn--secondary btn--md">Cancel</DialogClose>
            <DialogClose className="btn btn--primary btn--md">Rename</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    ),
    Dont: () => (
      <Dialog defaultOpen>
        <DialogContent size="sm" showClose={false}>
          <DialogDescription>The new name appears everywhere the old one did.</DialogDescription>
          <DialogFooter>
            <DialogClose className="btn btn--secondary btn--md">Cancel</DialogClose>
            <DialogClose className="btn btn--primary btn--md">Rename</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    ),
  },

  footer: {
    ...staged,
    Do: () => (
      <Dialog defaultOpen>
        <DialogContent size="sm">
          <DialogTitle>Share access</DialogTitle>
          <DialogDescription>People you add can open this straight away.</DialogDescription>
          <DialogFooter>
            <DialogClose className="btn btn--secondary btn--md">Cancel</DialogClose>
            <DialogClose className="btn btn--primary btn--md">Share</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    ),
    // Four peers in the footer: leaving is now as much work as deciding.
    Dont: () => (
      <Dialog defaultOpen>
        <DialogContent size="sm">
          <DialogTitle>Share access</DialogTitle>
          <DialogDescription>People you add can open this straight away.</DialogDescription>
          <DialogFooter>
            <Button intent="secondary" size="sm">Cancel</Button>
            <Button intent="secondary" size="sm">Save draft</Button>
            <Button intent="primary" size="sm">Share</Button>
            <Button intent="primary" size="sm">Copy link</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    ),
  },
};
