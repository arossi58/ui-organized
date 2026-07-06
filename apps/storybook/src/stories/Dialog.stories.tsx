import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogFooter,
} from "@ui-organized/react";

const meta: Meta<typeof Dialog> = {
  title: "Components/Overlay/Dialog",
  component: Dialog,
  tags: ["!dev"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A modal dialog with a backdrop and focus trap. Compose `<Dialog>` with `<DialogTrigger>`, `<DialogContent>` (sizes: sm/md/lg/fullscreen), `<DialogTitle>`, `<DialogDescription>`, and `<DialogFooter>`.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Dialog>;

export const Inspect: Story = {
  tags: ["dev"],
  render: () => (
    <Dialog>
      <DialogTrigger className="btn btn--primary btn--md">Delete project</DialogTrigger>
      <DialogContent>
        <DialogTitle>Delete project</DialogTitle>
        <DialogDescription>
          This action cannot be undone. This permanently deletes the project and all of its data.
        </DialogDescription>
        <DialogFooter>
          <DialogClose className="btn btn--secondary btn--md">Cancel</DialogClose>
          <DialogClose className="btn btn--destructive btn--md">Delete</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 12 }}>
      {(["sm", "md", "lg"] as const).map((size) => (
        <Dialog key={size}>
          <DialogTrigger className="btn btn--secondary btn--md">{size}</DialogTrigger>
          <DialogContent size={size}>
            <DialogTitle>Size: {size}</DialogTitle>
            <DialogDescription>
              The dialog popup width adapts to the chosen size preset.
            </DialogDescription>
            <DialogFooter>
              <DialogClose className="btn btn--primary btn--md">Got it</DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ))}
    </div>
  ),
};
