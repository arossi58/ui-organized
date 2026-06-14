import type { Meta, StoryObj } from "@storybook/react-vite";
import { Tabs } from "@ds/react";

const BASIC_TABS = [
  { value: "overview", label: "Overview", content: <p style={{ margin: 0 }}>Overview panel content goes here.</p> },
  { value: "analytics", label: "Analytics", content: <p style={{ margin: 0 }}>Analytics data and charts.</p> },
  { value: "settings", label: "Settings", content: <p style={{ margin: 0 }}>Configuration and preferences.</p> },
  { value: "billing", label: "Billing", disabled: true, content: <p style={{ margin: 0 }}>Billing information.</p> },
];

const meta: Meta<typeof Tabs> = {
  title: "Components/Tabs",
  component: Tabs,
  parameters: {
    layout: "padded",
  },
  argTypes: {
    orientation: {
      control: "select",
      options: ["horizontal", "vertical"],
    },
    size: {
      control: "select",
      options: ["default", "small"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Tabs>;

export const Default: Story = {
  args: {
    tabs: BASIC_TABS,
    defaultValue: "overview",
  },
};

export const Horizontal: Story = {
  args: {
    tabs: BASIC_TABS,
    defaultValue: "overview",
    orientation: "horizontal",
  },
};

export const Vertical: Story = {
  args: {
    tabs: BASIC_TABS,
    defaultValue: "overview",
    orientation: "vertical",
  },
};

export const Small: Story = {
  args: {
    tabs: BASIC_TABS,
    defaultValue: "overview",
    size: "small",
  },
};

export const WithDisabledTab: Story = {
  render: () => (
    <Tabs
      tabs={BASIC_TABS}
      defaultValue="overview"
    />
  ),
};

export const RichContent: Story = {
  render: () => (
    <Tabs
      tabs={[
        {
          value: "profile",
          label: "Profile",
          content: (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <p style={{ margin: 0, color: "var(--color-text-text-secondary)" }}>
                Manage your personal information and account settings.
              </p>
            </div>
          ),
        },
        {
          value: "notifications",
          label: "Notifications",
          content: (
            <p style={{ margin: 0, color: "var(--color-text-text-secondary)" }}>
              Configure how and when you receive notifications.
            </p>
          ),
        },
        {
          value: "security",
          label: "Security",
          content: (
            <p style={{ margin: 0, color: "var(--color-text-text-secondary)" }}>
              Manage your password, two-factor authentication, and sessions.
            </p>
          ),
        },
      ]}
      defaultValue="profile"
    />
  ),
};
