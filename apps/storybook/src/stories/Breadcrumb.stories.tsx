import type { Meta, StoryObj } from "@storybook/react-vite";
import { Breadcrumb } from "@ui-organized/react";

const meta: Meta<typeof Breadcrumb> = {
  title: "Components/Navigation/Breadcrumb",
  component: Breadcrumb,
  tags: ["!dev"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "A trail of links showing the current page's location in a hierarchy. Pass `items`; the last item renders as the current page (`aria-current`).",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Breadcrumb>;

export const Inspect: Story = {
  tags: ["dev"],
  render: () => (
    <Breadcrumb
      items={[
        { label: "Home", href: "#", icon: "home" },
        { label: "Components", href: "#" },
        { label: "Breadcrumb" },
      ]}
    />
  ),
};

export const TwoLevels: Story = {
  render: () => (
    <Breadcrumb
      items={[
        { label: "Settings", href: "#" },
        { label: "Billing" },
      ]}
    />
  ),
};
