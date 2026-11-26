import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Breadcrumb,
  Button,
  Card,
  CardBody,
  PageHeader,
  SectionFooter,
  SectionHeader,
  Tabs,
} from "@ui-organized/react";

const CRUMBS = [{ label: "Settings", href: "#" }, { label: "Billing" }];

const meta: Meta<typeof PageHeader> = {
  title: "Components/Layout/PageHeader",
  component: PageHeader,
  tags: ["!dev"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "The top of a page: a breadcrumb trail, the title and description, the page's actions, and an optional row of tabs. SectionHeader and SectionFooter are the same pattern one level down.",
      },
    },
  },
  argTypes: {
    size: { control: "inline-radio", options: ["md", "lg"] },
    headingLevel: { control: "select", options: [1, 2, 3, 4, 5, 6] },
    divided: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof PageHeader>;

export const Inspect: Story = {
  tags: ["dev"],
  args: {
    title: "Billing",
    description: "Plans, invoices and payment methods for this workspace.",
    size: "md",
    divided: true,
  },
  render: (args) => (
    <PageHeader
      {...args}
      breadcrumbs={<Breadcrumb items={CRUMBS} />}
      actions={
        <>
          <Button intent="secondary">Download invoices</Button>
          <Button>Upgrade plan</Button>
        </>
      }
    />
  ),
};

/** Everything at once: breadcrumbs, description, actions and a rule. */
export const Default: Story = {
  render: () => (
    <PageHeader
      title="Billing"
      description="Plans, invoices and payment methods for this workspace."
      breadcrumbs={<Breadcrumb items={CRUMBS} />}
      actions={
        <>
          <Button intent="secondary">Download invoices</Button>
          <Button>Upgrade plan</Button>
        </>
      }
      divided
    />
  ),
};

/** The Tabs' panels hold the page body, so the tab list is the header's lower edge. */
export const WithTabs: Story = {
  render: () => (
    <PageHeader
      title="Project settings"
      description="Everything about this project, one tab at a time."
      actions={<Button intent="secondary">Share</Button>}
      tabs={
        <Tabs
          tabs={[
            {
              value: "general",
              label: "General",
              content: <p className="text-default-body-medium">General settings.</p>,
            },
            {
              value: "members",
              label: "Members",
              count: 12,
              content: <p className="text-default-body-medium">Members.</p>,
            },
            {
              value: "billing",
              label: "Billing",
              content: <p className="text-default-body-medium">Billing.</p>,
            },
          ]}
        />
      }
    />
  ),
};

/** `md` for an app page, `lg` for a docs or landing page. */
export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
      <PageHeader title="Billing" description="Plans, invoices and payment methods." size="md" />
      <PageHeader title="Billing" description="Plans, invoices and payment methods." size="lg" />
    </div>
  ),
};

/** Actions wrap below the title when the page is narrow; no media query is involved. */
export const Narrow: Story = {
  render: () => (
    <div style={{ width: 360 }}>
      <PageHeader
        title="Billing"
        description="Plans, invoices and payment methods for this workspace."
        actions={
          <>
            <Button intent="secondary">Download</Button>
            <Button>Upgrade</Button>
          </>
        }
      />
    </div>
  ),
};

/** A section inside a page, with its own actions, and the footer that closes it. */
export const Sections: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 32, maxWidth: 720 }}>
      <SectionHeader
        title="Recent orders"
        description="The last 30 days, newest first."
        actions={
          <Button intent="ghost" size="sm">
            View all
          </Button>
        }
        divided
      />
      <Card>
        <CardBody>
          <SectionHeader
            title="Payment method"
            size="sm"
            actions={
              <Button intent="secondary" size="sm">
                Change
              </Button>
            }
          />
          <SectionFooter
            actions={
              <Button intent="ghost" size="sm">
                Remove
              </Button>
            }
            divided
          >
            Visa ending in 4242, expires 08/28
          </SectionFooter>
        </CardBody>
      </Card>
      <SectionHeader
        title="One plan for every team"
        description="Start free, then pay for what you use."
        align="center"
        actions={<Button>Start free</Button>}
      />
    </div>
  ),
};
