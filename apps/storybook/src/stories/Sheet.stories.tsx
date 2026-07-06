import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetTitle,
  SheetDescription,
  SheetClose,
  SheetFooter,
} from "@ui-organized/react";

const meta: Meta<typeof Sheet> = {
  title: "Components/Overlay/Sheet",
  component: Sheet,
  tags: ["!dev"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "An edge-anchored panel built on the Dialog primitive. `<SheetContent>` takes `side` (top/right/bottom/left) and `size` (sm/md/lg) and slides in from the chosen edge.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Sheet>;

export const Inspect: Story = {
  tags: ["dev"],
  render: () => (
    <Sheet>
      <SheetTrigger className="btn btn--primary btn--md">Open sheet</SheetTrigger>
      <SheetContent>
        <SheetTitle>Edit profile</SheetTitle>
        <SheetDescription>Make changes to your profile here. Click save when you're done.</SheetDescription>
        <SheetFooter>
          <SheetClose className="btn btn--secondary btn--md">Cancel</SheetClose>
          <SheetClose className="btn btn--primary btn--md">Save</SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
};

export const Sides: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
      {(["top", "right", "bottom", "left"] as const).map((side) => (
        <Sheet key={side}>
          <SheetTrigger className="btn btn--secondary btn--md">{side}</SheetTrigger>
          <SheetContent side={side}>
            <SheetTitle>Side: {side}</SheetTitle>
            <SheetDescription>The panel slides in from the {side} edge.</SheetDescription>
            <SheetFooter>
              <SheetClose className="btn btn--primary btn--md">Close</SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      ))}
    </div>
  ),
};
