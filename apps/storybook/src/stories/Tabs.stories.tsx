import type { Meta, StoryObj } from "@storybook/react-vite";
import { Tabs } from "@ui-organized/react";

const BASIC_TABS = [
  { value: "overview", label: "Overview", content: <p style={{ margin: 0 }}>Overview panel content goes here.</p> },
  { value: "analytics", label: "Analytics", content: <p style={{ margin: 0 }}>Analytics data and charts.</p> },
  { value: "settings", label: "Settings", content: <p style={{ margin: 0 }}>Configuration and preferences.</p> },
  { value: "billing", label: "Billing", disabled: true, content: <p style={{ margin: 0 }}>Billing information.</p> },
];

const meta: Meta<typeof Tabs> = {
  title: "Components/Navigation/Tabs",
  component: Tabs,
  tags: ["!dev"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Tabs organize content into switchable panels. Pass a `tabs` array of `{ value, label, content, disabled }` items, set the initial panel with `defaultValue`, and use `orientation` and `size` to adjust layout and density.",
      },
    },
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

export const Inspect: Story = {
  tags: ["dev"],
  parameters: {
    docs: {
      source: {
        code: `
<Tabs tabs={BASIC_TABS} defaultValue="overview" />
`.trim(),
      },
    },
  },
  args: {
    tabs: BASIC_TABS,
    defaultValue: "overview",
  },
};

export const Horizontal: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<Tabs tabs={BASIC_TABS} defaultValue="overview" orientation="horizontal" />
`.trim(),
      },
    },
  },
  args: {
    tabs: BASIC_TABS,
    defaultValue: "overview",
    orientation: "horizontal",
  },
};

export const Vertical: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<Tabs tabs={BASIC_TABS} defaultValue="overview" orientation="vertical" />
`.trim(),
      },
    },
  },
  args: {
    tabs: BASIC_TABS,
    defaultValue: "overview",
    orientation: "vertical",
  },
};

export const Small: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<Tabs tabs={BASIC_TABS} defaultValue="overview" size="small" />
`.trim(),
      },
    },
  },
  args: {
    tabs: BASIC_TABS,
    defaultValue: "overview",
    size: "small",
  },
};

export const WithDisabledTab: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<Tabs
  tabs={[
    { value: "overview", label: "Overview", content: <p>Overview panel content goes here.</p> },
    { value: "analytics", label: "Analytics", content: <p>Analytics data and charts.</p> },
    { value: "settings", label: "Settings", content: <p>Configuration and preferences.</p> },
    { value: "billing", label: "Billing", disabled: true, content: <p>Billing information.</p> },
  ]}
  defaultValue="overview"
/>
`.trim(),
      },
    },
  },
  render: () => (
    <Tabs
      tabs={BASIC_TABS}
      defaultValue="overview"
    />
  ),
};

export const RichContent: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<Tabs
  tabs={[
    {
      value: "profile",
      label: "Profile",
      content: (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <p>Manage your personal information and account settings.</p>
        </div>
      ),
    },
    {
      value: "notifications",
      label: "Notifications",
      content: <p>Configure how and when you receive notifications.</p>,
    },
    {
      value: "security",
      label: "Security",
      content: <p>Manage your password, two-factor authentication, and sessions.</p>,
    },
  ]}
  defaultValue="profile"
/>
`.trim(),
      },
    },
  },
  render: () => (
    <Tabs
      tabs={[
        {
          value: "profile",
          label: "Profile",
          content: (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <p style={{ margin: 0, color: "var(--color-text-secondary)" }}>
                Manage your personal information and account settings.
              </p>
            </div>
          ),
        },
        {
          value: "notifications",
          label: "Notifications",
          content: (
            <p style={{ margin: 0, color: "var(--color-text-secondary)" }}>
              Configure how and when you receive notifications.
            </p>
          ),
        },
        {
          value: "security",
          label: "Security",
          content: (
            <p style={{ margin: 0, color: "var(--color-text-secondary)" }}>
              Manage your password, two-factor authentication, and sessions.
            </p>
          ),
        },
      ]}
      defaultValue="profile"
    />
  ),
};
