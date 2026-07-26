import type { Meta, StoryObj } from "@storybook/react-vite";
import { ToastProvider, useToastManager } from "@ui-organized/react";

const meta: Meta = {
  tags: ["!dev"],
  title: "Components/Feedback/Toast",
  parameters: {
    layout: "centered",
    // This file has no `component:` (the story is driven by a hook, not a single
    // element) and its title leaf is "Toast" while the exported component is
    // `ToastProvider`, so neither of the automatic joins can find the manifest
    // entry. Naming it explicitly is the escape hatch — read by the native docs
    // registry (apps/marketing/src/docs/registry.ts); Storybook ignores it.
    codeConnect: { codeName: "ToastProvider" },
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

export const Inspect: Story = {
  tags: ["dev"],
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
