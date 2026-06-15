import type { Meta, StoryObj } from "@storybook/react-vite";
import { Icon, NavItem, NavSubItem, Sidebar } from "@ui-organized/react";

/** Sidebar-like surface so the transparent nav items read against a panel. */
function NavSurface({
  children,
  collapsed = false,
}: {
  children: React.ReactNode;
  collapsed?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--spacing-space-02)",
        width: collapsed ? "72px" : "260px",
        padding: "var(--spacing-space-04)",
        borderRadius: "var(--radius-interactive)",
        background: "var(--color-surface-base)",
        border: "1px solid var(--color-border-primary)",
        transition: "width 200ms ease",
      }}
    >
      {children}
    </div>
  );
}

const meta: Meta<typeof NavItem> = {
  title: "Components/Navigation",
  component: NavItem,
  parameters: {
    layout: "padded",
  },
  argTypes: {
    icon: {
      control: "select",
      options: [undefined, "home", "settings", "user", "grid", "calendar", "mail"],
    },
    selected: { control: "boolean" },
    disabled: { control: "boolean" },
  },
  decorators: [
    // Most stories render against a fixed-width surface. Interactive stories that
    // manage their own surface (e.g. the collapse demo) opt out via `noSurface`.
    (Story, context) =>
      context.parameters.noSurface ? (
        <Story />
      ) : (
        <NavSurface>
          <Story />
        </NavSurface>
      ),
  ],
};

export default meta;
type Story = StoryObj<typeof NavItem>;

/* ─── Single main page item ──────────────────────────────────────────────────── */

export const Default: Story = {
  args: {
    label: "Dashboard",
    icon: "home",
    selected: false,
    disabled: false,
  },
};

export const Selected: Story = {
  args: {
    label: "Dashboard",
    icon: "home",
    selected: true,
  },
};

export const Disabled: Story = {
  args: {
    label: "Dashboard",
    icon: "home",
    disabled: true,
  },
};

export const WithoutIcon: Story = {
  args: {
    label: "Dashboard",
  },
};

/* ─── Collapsed icon-only rail ───────────────────────────────────────────────── */

/**
 * Collapsed rail. Hiding the label shrinks each item's width down to a square —
 * the height is unchanged from the expanded state and the icon sits inside even
 * padding on all four sides (rather than ballooning to fill the rail width).
 */
export const CollapsedRail: Story = {
  parameters: { noSurface: true },
  render: () => (
    <NavSurface collapsed>
      <NavItem label="Home" icon="home" collapsed />
      <NavItem label="Dashboard" icon="grid" selected collapsed />
      <NavItem label="Messages" icon="mail" collapsed />
      <NavItem label="Calendar" icon="calendar" collapsed />
      <NavItem label="Settings" icon="settings" collapsed />
      <NavItem label="Archived" icon="bookmark" disabled collapsed />
    </NavSurface>
  ),
};

/**
 * Expanded vs. collapsed, side by side: collapsing changes only the width. Each
 * row keeps the exact same height, so the icons stay aligned across both rails.
 */
export const ExpandedVsCollapsed: Story = {
  parameters: { noSurface: true },
  render: () => (
    <div
      style={{
        display: "flex",
        gap: "var(--spacing-space-04)",
        alignItems: "flex-start",
      }}
    >
      <NavSurface>
        <NavItem label="Home" icon="home" />
        <NavItem label="Dashboard" icon="grid" selected />
        <NavItem label="Messages" icon="mail" />
        <NavItem label="Settings" icon="settings" />
      </NavSurface>
      <NavSurface collapsed>
        <NavItem label="Home" icon="home" collapsed />
        <NavItem label="Dashboard" icon="grid" selected collapsed />
        <NavItem label="Messages" icon="mail" collapsed />
        <NavItem label="Settings" icon="settings" collapsed />
      </NavSurface>
    </div>
  ),
};

/* ─── Expandable item with sub-pages ─────────────────────────────────────────── */

export const Expandable: Story = {
  render: () => (
    <NavItem label="Reports" icon="grid" selected defaultExpanded>
      <NavSubItem label="Overview" selected />
      <NavSubItem label="Revenue" />
      <NavSubItem label="Traffic" />
      <NavSubItem label="Conversions" />
      <NavSubItem label="Retention" />
    </NavItem>
  ),
};

export const ExpandableCollapsed: Story = {
  render: () => (
    <NavItem label="Reports" icon="grid">
      <NavSubItem label="Overview" />
      <NavSubItem label="Revenue" />
      <NavSubItem label="Traffic" />
    </NavItem>
  ),
};

/* ─── Sub-item states (standalone) ───────────────────────────────────────────── */

export const SubItemStates: Story = {
  render: () => (
    <>
      <NavSubItem label="Default" />
      <NavSubItem label="Selected" selected />
      <NavSubItem label="Disabled" disabled />
    </>
  ),
};

/* ─── Realistic sidebar nav ──────────────────────────────────────────────────── */

export const SidebarNav: Story = {
  render: () => (
    <>
      <NavItem label="Home" icon="home" />
      <NavItem label="Dashboard" icon="grid" selected defaultExpanded>
        <NavSubItem label="Overview" selected />
        <NavSubItem label="Activity" />
        <NavSubItem label="Insights" />
      </NavItem>
      <NavItem label="Messages" icon="mail" />
      <NavItem label="Calendar" icon="calendar">
        <NavSubItem label="Upcoming" />
        <NavSubItem label="Past events" />
      </NavItem>
      <NavItem label="Team" icon="users" />
      <NavItem label="Settings" icon="settings" />
      <NavItem label="Archived" icon="bookmark" disabled />
    </>
  ),
};

/* ─── Full Sidebar container ─────────────────────────────────────────────────── */

/** Full-height host so the sidebar's logo/nav/footer regions lay out correctly. */
function SidebarStage({ children }: { children: React.ReactNode }) {
  return <div style={{ height: "100vh", display: "flex" }}>{children}</div>;
}

const Wordmark = (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: "var(--spacing-space-02)",
      color: "var(--color-text-text-primary)",
      fontFamily: "var(--type-font-heading)",
      fontWeight: 600,
      fontSize: "20px",
      whiteSpace: "nowrap",
    }}
  >
    <Icon name="grid" size={24} />
    UI Organized
  </span>
);

const SidebarItems = (
  <>
    <NavItem label="Home" icon="home" />
    <NavItem label="Dashboard" icon="grid" selected defaultExpanded>
      <NavSubItem label="Overview" selected />
      <NavSubItem label="Activity" />
      <NavSubItem label="Insights" />
    </NavItem>
    <NavItem label="Messages" icon="mail" />
    <NavItem label="Calendar" icon="calendar">
      <NavSubItem label="Upcoming" />
      <NavSubItem label="Past events" />
    </NavItem>
    <NavItem label="Team" icon="users" />
    <NavItem label="Settings" icon="settings" />
  </>
);

/** The complete sidebar: logo slot, scrollable nav, and a footer slot. */
export const FullSidebar: Story = {
  parameters: { noSurface: true, layout: "fullscreen" },
  render: () => (
    <SidebarStage>
      <Sidebar
        logo={Wordmark}
        logoCollapsed={<Icon name="grid" size={24} />}
        footer={<NavItem label="Help & Support" icon="info" />}
      >
        {SidebarItems}
      </Sidebar>
    </SidebarStage>
  ),
};

/**
 * Collapsible sidebar — pass `collapsible` and the expand/collapse toggle is
 * rendered (and wired up) in the footer automatically. Click it to collapse the
 * whole sidebar to an icon-only rail.
 */
export const CollapsibleSidebar: Story = {
  parameters: { noSurface: true, layout: "fullscreen" },
  render: () => (
    <SidebarStage>
      <Sidebar
        collapsible
        logo={Wordmark}
        logoCollapsed={<Icon name="grid" size={24} />}
        footer={<NavItem label="Help & Support" icon="info" />}
      >
        {SidebarItems}
      </Sidebar>
    </SidebarStage>
  ),
};

/** Start collapsed — drive the collapsed state yourself via `defaultCollapsed`. */
export const SidebarStartCollapsed: Story = {
  parameters: { noSurface: true, layout: "fullscreen" },
  render: () => (
    <SidebarStage>
      <Sidebar
        collapsible
        defaultCollapsed
        logo={Wordmark}
        logoCollapsed={<Icon name="grid" size={24} />}
        footer={<NavItem label="Help & Support" icon="info" />}
      >
        {SidebarItems}
      </Sidebar>
    </SidebarStage>
  ),
};
