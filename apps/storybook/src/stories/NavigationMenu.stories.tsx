import type { Meta, StoryObj } from "@storybook/react-vite";
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink } from "@ui-organized/react";

const meta: Meta<typeof NavigationMenu> = {
  title: "Components/Navigation/NavigationMenu",
  component: NavigationMenu,
  tags: ["!dev"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "A site's top navigation: triggers that each open a panel of links, and links that go straight to a page. A panel opens on hover or on a click; arrow keys move along the bar and down into an open panel.",
      },
    },
  },
  // Room under the bar, so an open panel sits inside the story rather than
  // hanging off the bottom of it (and inside the visual gate's capture).
  decorators: [
    (Story) => (
      <div style={{ minHeight: 360 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof NavigationMenu>;

function Menu(props: React.ComponentProps<typeof NavigationMenu>) {
  return (
    <NavigationMenu aria-label="Main" {...props}>
      <NavigationMenuItem value="product" label="Product">
        <NavigationMenuLink
          href="#reports"
          icon="file-text"
          description="Charts of every metric you track."
        >
          Reports
        </NavigationMenuLink>
        <NavigationMenuLink
          href="#alerts"
          icon="mail"
          description="Hear about changes as they happen."
        >
          Alerts
        </NavigationMenuLink>
        <NavigationMenuLink href="#access" icon="lock" description="Decide who sees what.">
          Access
        </NavigationMenuLink>
      </NavigationMenuItem>
      <NavigationMenuItem value="resources" label="Resources">
        <NavigationMenuLink
          href="#guides"
          icon="life-buoy"
          description="Step by step, from setup to launch."
        >
          Guides
        </NavigationMenuLink>
        <NavigationMenuLink
          href="#events"
          icon="calendar"
          description="Talks and workshops near you."
        >
          Events
        </NavigationMenuLink>
      </NavigationMenuItem>
      <NavigationMenuItem value="pricing" label="Pricing" href="#pricing" />
      <NavigationMenuItem value="about" label="About" href="#about" />
    </NavigationMenu>
  );
}

export const Inspect: Story = {
  tags: ["dev"],
  render: (args) => <Menu {...args} />,
};

export const Default: Story = {
  render: () => <Menu />,
};

/** Open on first render, as `defaultValue` leaves it. */
export const Open: Story = {
  render: () => <Menu defaultValue="product" />,
};

/** `columns` lays a panel out in two or three columns of links. */
export const Columns: Story = {
  render: () => (
    <NavigationMenu aria-label="Main" defaultValue="product">
      <NavigationMenuItem value="product" label="Product" columns={2}>
        <NavigationMenuLink
          href="#reports"
          icon="file-text"
          description="Charts of every metric you track."
        >
          Reports
        </NavigationMenuLink>
        <NavigationMenuLink
          href="#alerts"
          icon="mail"
          description="Hear about changes as they happen."
        >
          Alerts
        </NavigationMenuLink>
        <NavigationMenuLink href="#access" icon="lock" description="Decide who sees what.">
          Access
        </NavigationMenuLink>
        <NavigationMenuLink href="#search" icon="search" description="Find any record in a second.">
          Search
        </NavigationMenuLink>
      </NavigationMenuItem>
      <NavigationMenuItem value="pricing" label="Pricing" href="#pricing" />
    </NavigationMenu>
  ),
};

/** Links without icons or descriptions, and the current page marked in the bar and in a panel. */
export const CurrentPage: Story = {
  render: () => (
    <NavigationMenu aria-label="Main" defaultValue="company">
      <NavigationMenuItem value="home" label="Home" href="#home" />
      <NavigationMenuItem value="company" label="Company">
        <NavigationMenuLink href="#team" current>
          Team
        </NavigationMenuLink>
        <NavigationMenuLink href="#careers">Careers</NavigationMenuLink>
        <NavigationMenuLink href="#press">Press</NavigationMenuLink>
      </NavigationMenuItem>
      <NavigationMenuItem value="blog" label="Blog" href="#blog" current />
      <NavigationMenuItem value="admin" label="Admin" disabled>
        <NavigationMenuLink href="#users">Users</NavigationMenuLink>
      </NavigationMenuItem>
    </NavigationMenu>
  ),
};
