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
          "Tabs organize content into switchable panels.",
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
    variant: {
      control: "select",
      options: ["underline", "pill", "bordered"],
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
              <p style={{ margin: 0, color: "var(--color-content-secondary)" }}>
                Manage your personal information and account settings.
              </p>
            </div>
          ),
        },
        {
          value: "notifications",
          label: "Notifications",
          content: (
            <p style={{ margin: 0, color: "var(--color-content-secondary)" }}>
              Configure how and when you receive notifications.
            </p>
          ),
        },
        {
          value: "security",
          label: "Security",
          content: (
            <p style={{ margin: 0, color: "var(--color-content-secondary)" }}>
              Manage your password, two-factor authentication, and sessions.
            </p>
          ),
        },
      ]}
      defaultValue="profile"
    />
  ),
};

const COUNTED_TABS = [
  { value: "inbox", label: "Inbox", count: 12, content: <p style={{ margin: 0 }}>Twelve unread messages.</p> },
  { value: "assigned", label: "Assigned to me", count: 3, content: <p style={{ margin: 0 }}>Three open items.</p> },
  { value: "archive", label: "Archive", content: <p style={{ margin: 0 }}>Nothing new here.</p> },
];

/** `underline` (the default), `pill` and `bordered`. */
export const Variants: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<Tabs tabs={tabs} variant="underline" />
<Tabs tabs={tabs} variant="pill" />
<Tabs tabs={tabs} variant="bordered" />
`.trim(),
      },
    },
  },
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {(["underline", "pill", "bordered"] as const).map((variant) => (
        <Tabs key={variant} tabs={BASIC_TABS} defaultValue="overview" variant={variant} />
      ))}
    </div>
  ),
};

/** `count` on a tab adds a pill after its label, read as part of the tab's name. */
export const WithCounts: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<Tabs
  variant="pill"
  tabs={[
    { value: "inbox", label: "Inbox", count: 12, content: … },
    { value: "assigned", label: "Assigned to me", count: 3, content: … },
    { value: "archive", label: "Archive", content: … },
  ]}
/>
`.trim(),
      },
    },
  },
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {(["underline", "pill", "bordered"] as const).map((variant) => (
        <Tabs key={variant} tabs={COUNTED_TABS} defaultValue="inbox" variant={variant} />
      ))}
    </div>
  ),
};

/** The pill and bordered looks stand up too, for settings-style navigation. */
export const VerticalVariants: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {(["pill", "bordered"] as const).map((variant) => (
        <Tabs key={variant} tabs={BASIC_TABS} defaultValue="overview" variant={variant} orientation="vertical" />
      ))}
    </div>
  ),
};
