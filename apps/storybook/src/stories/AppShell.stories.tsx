import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  AppHeader,
  AppShell,
  Button,
  DescriptionList,
  Item,
  ItemGroup,
  NavItem,
  NavSubItem,
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  PageHeader,
  Sidebar,
  Stat,
} from "@ui-organized/react";

const meta: Meta<typeof AppShell> = {
  title: "Components/Layout/AppShell",
  component: AppShell,
  tags: ["!dev"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "An application's frame: a header across the top, a sidebar down the side, and the page beside it. Below the breakpoint the sidebar moves into a sheet that the header's menu button opens.",
      },
    },
  },
  // A frame of fixed height with `scroll="main"`, so the story is the shell
  // as a page would hold it, without scrolling the canvas itself.
  decorators: [
    (Story) => (
      <div style={{ height: 560 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof AppShell>;

const logo = <span className="text-strong-body-large">Acme</span>;

const header = (
  <AppHeader
    logo={logo}
    nav={
      <NavigationMenu aria-label="Main">
        <NavigationMenuItem value="product" label="Product">
          <NavigationMenuLink href="#reports" description="Charts of every metric you track.">
            Reports
          </NavigationMenuLink>
          <NavigationMenuLink href="#alerts" description="Hear about changes as they happen.">
            Alerts
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem value="pricing" label="Pricing" href="#pricing" />
      </NavigationMenu>
    }
    actions={<Button intent="secondary">Sign in</Button>}
  />
);

const sidebar = (
  <Sidebar>
    <NavItem label="Home" icon="house" />
    <NavItem label="Reports" icon="file-text" selected />
    <NavItem label="Team" icon="users">
      <NavSubItem label="Members" />
      <NavSubItem label="Roles" />
    </NavItem>
    <NavItem label="Settings" icon="settings" />
  </Sidebar>
);

function Page() {
  return (
    <div style={{ padding: 24 }}>
      <PageHeader title="Reports" description="Every report your team has shared, newest first." />
    </div>
  );
}

export const Inspect: Story = {
  tags: ["dev"],
  args: { layout: "rail", scroll: "main" },
  render: (args) => (
    <AppShell {...args} header={header} sidebar={sidebar}>
      <Page />
    </AppShell>
  ),
};

/** `layout="auto"`, the default: a rail on a wide screen, a sheet at 900px and below. Resize to see it switch. */
export const Auto: Story = {
  render: () => (
    <AppShell scroll="main" header={header} sidebar={sidebar}>
      <Page />
    </AppShell>
  ),
};

/** The sidebar as a rail beside the page, as `auto` is on a wide screen. */
export const Rail: Story = {
  render: () => (
    <AppShell layout="rail" scroll="main" header={header} sidebar={sidebar}>
      <Page />
    </AppShell>
  ),
};

/**
 * The sheet layout, as `auto` is below the breakpoint: the header leads with
 * the menu button and drops its navigation, and the sidebar is in a sheet.
 */
export const Sheet: Story = {
  render: () => (
    <AppShell layout="sheet" scroll="main" header={header} sidebar={sidebar}>
      <Page />
    </AppShell>
  ),
};

/** A dashboard: PageHeader, a row of Stats, a DescriptionList and an ItemGroup in the main area. */
export const Dashboard: Story = {
  render: () => (
    <AppShell layout="rail" scroll="main" header={header} sidebar={sidebar}>
      <div style={{ display: "grid", gap: 24, padding: 24 }}>
        <PageHeader
          title="Overview"
          description="This week, compared with the week before."
          actions={<Button intent="secondary">Export</Button>}
        />
        <div
          style={{
            display: "grid",
            gap: 16,
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          }}
        >
          <Stat label="Visitors" value="12,480" delta="8%" trend="up" />
          <Stat label="Sign-ups" value="1,204" delta="3%" trend="down" />
          <Stat label="Median session" value="4m 12s" delta="0%" trend="flat" />
        </div>
        <DescriptionList
          items={[
            { term: "Plan", details: "Team" },
            { term: "Seats", details: "18 of 25" },
            { term: "Renews", details: "1 March" },
          ]}
        />
        <ItemGroup variant="outline">
          <Item title="Weekly digest" description="A summary of your activity, every Monday." />
          <Item title="Usage alerts" description="When a metric moves more than you expect." />
        </ItemGroup>
      </div>
    </AppShell>
  ),
};

/** The header alone, outside an AppShell: no menu button, since there is no sheet to open. */
export const Header: Story = {
  render: () => header,
};
