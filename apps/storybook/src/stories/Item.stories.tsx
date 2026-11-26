import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Avatar, Button, Card, CardBody, Item, ItemGroup, Switch } from "@ui-organized/react";

const meta: Meta<typeof Item> = {
  title: "Components/Data Display/Item",
  component: Item,
  tags: ["!dev"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "A row: media, a title with a line of description, and actions at the end. With a link, the whole row follows it and the actions stay their own controls. `ItemGroup` lists rows together.",
      },
    },
  },
  argTypes: {
    variant: { control: "inline-radio", options: ["plain", "outline", "muted"] },
    size: { control: "inline-radio", options: ["sm", "md"] },
  },
};

export default meta;
type Story = StoryObj<typeof Item>;

export const Inspect: Story = {
  tags: ["dev"],
  args: {
    title: "Product updates",
    description: "News about features and releases.",
    icon: "mail",
    variant: "outline",
    size: "md",
  },
  render: (args) => (
    <div style={{ maxWidth: 480 }}>
      <Item {...args} />
    </div>
  ),
};

export const Default: Story = {
  render: () => (
    <div style={{ maxWidth: 480 }}>
      <Item
        variant="outline"
        icon="mail"
        title="Product updates"
        description="News about features and releases."
        actions={<Switch defaultChecked aria-label="Product updates" />}
      />
    </div>
  ),
};

/**
 * `href` makes the whole row a link. The actions sit above it: pressing the
 * switch toggles it and leaves the page where it is.
 */
export const Links: Story = {
  render: function Render() {
    const [shares, setShares] = useState(0);
    return (
      <div style={{ maxWidth: 480 }}>
        <ItemGroup variant="outline">
          <Item
            icon="user"
            title="Profile"
            description="Your name, photo and contact details."
            href="#profile"
          />
          <Item
            icon="mail"
            title="Notifications"
            description="What we email you about, and how often."
            href="#notifications"
            actions={<Switch defaultChecked aria-label="Notifications" />}
          />
          <Item
            icon="folder-open"
            title="Shared files"
            description={`Shared ${shares} ${shares === 1 ? "time" : "times"} this session.`}
            href="#shared-files"
            actions={
              <Button size="sm" intent="secondary" onClick={() => setShares((n) => n + 1)}>
                Share
              </Button>
            }
          />
        </ItemGroup>
      </div>
    );
  },
};

/** `ItemGroup` lists rows with a rule between them, here inside a card. */
export const Group: Story = {
  render: () => (
    <Card style={{ maxWidth: 480 }}>
      <CardBody>
        <ItemGroup>
          <Item
            title="Product updates"
            description="News about features and releases."
            actions={<Switch defaultChecked aria-label="Product updates" />}
          />
          <Item
            title="Weekly digest"
            description="A summary of your account activity."
            actions={<Switch defaultChecked aria-label="Weekly digest" />}
          />
          <Item
            title="Tips and offers"
            description="Occasional ideas for getting more done."
            actions={<Switch aria-label="Tips and offers" />}
          />
        </ItemGroup>
      </CardBody>
    </Card>
  ),
};

/** `media` takes anything at the start, such as an Avatar. */
export const WithMedia: Story = {
  render: () => (
    <div style={{ maxWidth: 480 }}>
      <ItemGroup>
        <Item
          media={<Avatar name="Ada Lovelace" size="md" />}
          title="Ada Lovelace"
          description="Owner"
          actions={
            <Button size="sm" intent="tertiary">
              Manage
            </Button>
          }
        />
        <Item
          media={<Avatar name="Grace Hopper" size="md" />}
          title="Grace Hopper"
          description="Editor"
          actions={
            <Button size="sm" intent="tertiary">
              Manage
            </Button>
          }
        />
      </ItemGroup>
    </div>
  ),
};

export const Variants: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 480 }}>
      {(["plain", "outline", "muted"] as const).map((variant) => (
        <Item
          key={variant}
          variant={variant}
          icon="mail"
          title={`${variant[0].toUpperCase()}${variant.slice(1)}`}
          description="News about features and releases."
          href={`#${variant}`}
        />
      ))}
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 480 }}>
      {(["sm", "md"] as const).map((size) => (
        <Item
          key={size}
          size={size}
          variant="outline"
          icon="mail"
          title="Product updates"
          description="News about features and releases."
          actions={<Switch defaultChecked aria-label={`Product updates, ${size}`} />}
        />
      ))}
    </div>
  ),
};
