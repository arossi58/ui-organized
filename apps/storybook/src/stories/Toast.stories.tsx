import type { Meta, StoryObj } from "@storybook/react-vite";
import { ToastProvider, useToastManager } from "@ui-organized/react";

const meta: Meta = {
  title: "Components/Feedback/Toast",
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Transient notifications. Wrap your app once in `<ToastProvider>`, then call `useToastManager().add({ title, description, type })`. Status (`info`/`success`/`warning`/`error`) drives the accent and icon.",
      },
    },
  },
  decorators: [
    (Story) => (
      <ToastProvider>
        <Story />
      </ToastProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj;

export const Statuses: Story = {
  render: function StatusExample() {
    const toast = useToastManager();
    return (
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <button
          className="btn btn--secondary btn--md"
          onClick={() =>
            toast.add({ title: "Heads up", description: "Something happened.", type: "info" })
          }
        >
          Info
        </button>
        <button
          className="btn btn--secondary btn--md"
          onClick={() =>
            toast.add({ title: "Saved", description: "Your changes are live.", type: "success" })
          }
        >
          Success
        </button>
        <button
          className="btn btn--secondary btn--md"
          onClick={() =>
            toast.add({ title: "Careful", description: "This may need attention.", type: "warning" })
          }
        >
          Warning
        </button>
        <button
          className="btn btn--secondary btn--md"
          onClick={() =>
            toast.add({ title: "Error", description: "Something went wrong.", type: "error" })
          }
        >
          Error
        </button>
      </div>
    );
  },
};

export const WithAction: Story = {
  render: function ActionExample() {
    const toast = useToastManager();
    return (
      <button
        className="btn btn--primary btn--md"
        onClick={() =>
          toast.add({
            title: "Item deleted",
            description: "The file was moved to trash.",
            type: "info",
            actionProps: { children: "Undo" },
          })
        }
      >
        Delete with undo
      </button>
    );
  },
};
