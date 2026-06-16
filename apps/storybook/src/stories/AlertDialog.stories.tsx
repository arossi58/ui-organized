import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogConfirm,
} from "@ui-organized/react";

const meta: Meta<typeof AlertDialog> = {
  title: "Components/Overlay/AlertDialog",
  component: AlertDialog,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A focus-trapping confirmation dialog dismissed via explicit actions. Compose `<AlertDialog>` with `<AlertDialogContent>`, `<AlertDialogTitle>`, `<AlertDialogDescription>`, and a footer of `<AlertDialogCancel>` + `<AlertDialogConfirm>`.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof AlertDialog>;

export const Default: Story = {
  render: () => (
    <AlertDialog>
      <AlertDialogTrigger className="btn btn--destructive btn--md">Delete account</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogTitle>Delete account?</AlertDialogTitle>
        <AlertDialogDescription>
          This permanently deletes your account and all associated data. This action cannot be
          undone.
        </AlertDialogDescription>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogConfirm intent="destructive">Delete</AlertDialogConfirm>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
};

export const Confirmation: Story = {
  render: () => (
    <AlertDialog>
      <AlertDialogTrigger className="btn btn--primary btn--md">Publish</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogTitle>Publish changes?</AlertDialogTitle>
        <AlertDialogDescription>
          Your changes will become visible to everyone immediately.
        </AlertDialogDescription>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogConfirm>Publish</AlertDialogConfirm>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
};
