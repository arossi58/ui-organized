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
          "A trail of links showing the current page's location in a hierarchy.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Breadcrumb>;

export const Inspect: Story = {
  tags: ["dev"],
  // In args rather than the render, so the controls and the docs' live code see it.
  args: {
    items: [
      { label: "Home", href: "#", icon: "house" },
      { label: "Components", href: "#" },
      { label: "Breadcrumb" },
    ],
  },
  render: (args) => <Breadcrumb {...args} />,
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
