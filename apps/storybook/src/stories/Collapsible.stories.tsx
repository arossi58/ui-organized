import type { Meta, StoryObj } from "@storybook/react-vite";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@ui-organized/react";

const meta: Meta<typeof Collapsible> = {
  title: "Components/Disclosure/Collapsible",
  component: Collapsible,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "A single disclosure section that animates open and closed. Compose `<Collapsible>` with `<CollapsibleTrigger>` and `<CollapsibleContent>`.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Collapsible>;

export const Default: Story = {
  render: () => (
    <Collapsible style={{ maxWidth: 360 }}>
      <CollapsibleTrigger>Show details</CollapsibleTrigger>
      <CollapsibleContent>
        <p style={{ margin: 0 }}>
          This content is revealed when the trigger is activated. Its height animates via Ark UI's
          panel measurement, so it works with dynamic content.
        </p>
      </CollapsibleContent>
    </Collapsible>
  ),
};

export const InitiallyOpen: Story = {
  render: () => (
    <Collapsible defaultOpen style={{ maxWidth: 360 }}>
      <CollapsibleTrigger>Hide details</CollapsibleTrigger>
      <CollapsibleContent>
        <p style={{ margin: 0 }}>Starts expanded via `defaultOpen`.</p>
      </CollapsibleContent>
    </Collapsible>
  ),
};
