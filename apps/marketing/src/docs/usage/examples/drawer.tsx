import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerTitle,
} from "@ui-organized/react";
import type { UsageExampleSet } from "./types";

const staged = { layout: "centered" as const, containOverlays: true };

const PRIMARY = "text-default-body-large btn btn--primary btn--md";
const SECONDARY = "text-default-body-large btn btn--secondary btn--md";

function Share({ showClose = true }: { showClose?: boolean }) {
  return (
    <Drawer defaultOpen>
      <DrawerContent showClose={showClose}>
        <DrawerTitle>Share this page</DrawerTitle>
        <DrawerDescription>Anyone with the link can view it.</DrawerDescription>
        <DrawerFooter>
          <DrawerClose className={SECONDARY}>Cancel</DrawerClose>
          <DrawerClose className={PRIMARY}>Copy link</DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

export const drawerExamples: UsageExampleSet = {
  close: {
    ...staged,
    Do: () => <Share />,
    // The swipe is the only way out it shows.
    Dont: () => <Share showClose={false} />,
  },

  length: {
    ...staged,
    Do: () => <Share />,
    // A list that scrolls inside a panel that also moves.
    Dont: () => (
      <Drawer defaultOpen>
        <DrawerContent>
          <DrawerTitle>Choose a team</DrawerTitle>
          {Array.from({ length: 18 }, (_, i) => (
            <p key={i} className="text-default-body-medium" style={{ margin: 0 }}>
              Team {i + 1}
            </p>
          ))}
        </DrawerContent>
      </Drawer>
    ),
  },
};
