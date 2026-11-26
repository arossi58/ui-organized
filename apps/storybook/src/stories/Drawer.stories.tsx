import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerTitle,
  DrawerDescription,
  DrawerClose,
  DrawerFooter,
} from "@ui-organized/react";

const meta: Meta<typeof Drawer> = {
  title: "Components/Overlay/Drawer",
  component: Drawer,
  tags: ["!dev"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A panel along the bottom edge, dismissed by swiping it down, by Escape, by the backdrop or by its close button. Drag the grabber, or the content once it moves clearly downward.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Drawer>;

const PRIMARY = "text-default-body-large btn btn--primary btn--md";
const SECONDARY = "text-default-body-large btn btn--secondary btn--md";

export const Inspect: Story = {
  tags: ["dev"],
  render: (args) => (
    <Drawer {...args}>
      <DrawerTrigger className={PRIMARY}>Share</DrawerTrigger>
      <DrawerContent>
        <DrawerTitle>Share this page</DrawerTitle>
        <DrawerDescription>
          Anyone with the link can view it. Swipe down to close.
        </DrawerDescription>
        <DrawerFooter>
          <DrawerClose className={SECONDARY}>Cancel</DrawerClose>
          <DrawerClose className={PRIMARY}>Copy link</DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
};

export const Default: Story = {
  render: () => (
    <Drawer>
      <DrawerTrigger className={PRIMARY}>Share</DrawerTrigger>
      <DrawerContent>
        <DrawerTitle>Share this page</DrawerTitle>
        <DrawerDescription>
          Anyone with the link can view it. Swipe down to close.
        </DrawerDescription>
        <DrawerFooter>
          <DrawerClose className={SECONDARY}>Cancel</DrawerClose>
          <DrawerClose className={PRIMARY}>Copy link</DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
};

/**
 * Content taller than the drawer scrolls inside it. A drag on the content only
 * moves the panel once it is scrolled to the top; the grabber always does.
 */
export const LongContent: Story = {
  render: () => (
    <Drawer>
      <DrawerTrigger className={SECONDARY}>Release notes</DrawerTrigger>
      <DrawerContent>
        <DrawerTitle>What changed</DrawerTitle>
        {Array.from({ length: 24 }, (_, i) => (
          <p key={i} className="text-default-body-medium" style={{ margin: 0 }}>
            Change {i + 1}: a line of notes about what moved, so there is enough to scroll.
          </p>
        ))}
        <DrawerFooter>
          <DrawerClose className={PRIMARY}>Done</DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
};

/** Without the grabber or the close button: Escape, the backdrop and a swipe still close it. */
export const Plain: Story = {
  render: () => (
    <Drawer>
      <DrawerTrigger className={SECONDARY}>Open</DrawerTrigger>
      <DrawerContent showGrabber={false} showClose={false}>
        <DrawerTitle>Saved</DrawerTitle>
        <DrawerDescription>Your changes are saved to this device.</DrawerDescription>
        <DrawerFooter>
          <DrawerClose className={PRIMARY}>OK</DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
};
