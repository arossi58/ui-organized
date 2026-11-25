import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button, EmptyState, FeaturedIcon } from "@ui-organized/react";
import { STORY_ICON_NAMES } from "../storyIcons";

const meta: Meta<typeof EmptyState> = {
  title: "Components/Feedback/EmptyState",
  component: EmptyState,
  tags: ["!dev"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "What to show where content would be but isn't: a title, a sentence on why, and the action that fills it.",
      },
    },
  },
  argTypes: {
    icon: { control: "select", options: [undefined, ...STORY_ICON_NAMES] },
    size: { control: "select", options: ["sm", "md", "lg"] },
    headingLevel: { control: "select", options: [undefined, 1, 2, 3, 4, 5, 6] },
    title: { control: "text" },
    description: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof EmptyState>;

export const Inspect: Story = {
  tags: ["dev"],
  args: {
    icon: "folder-open",
    title: "No projects yet",
    description: "Projects you create or are invited to will show up here.",
    size: "md",
  },
};

export const WithActions: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<EmptyState
  icon="users"
  title="No members yet"
  description="Invite people to work on this project with you."
  actions={
    <>
      <Button icon="plus">Invite members</Button>
      <Button intent="secondary">Learn more</Button>
    </>
  }
/>
`.trim(),
      },
    },
  },
  render: () => (
    <EmptyState
      icon="users"
      title="No members yet"
      description="Invite people to work on this project with you."
      actions={
        <>
          <Button icon="plus">Invite members</Button>
          <Button intent="secondary">Learn more</Button>
        </>
      }
    />
  ),
};

/** `sm` for a table cell or a card, `md` for a panel, `lg` for a page. */
export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "48px" }}>
      {(["sm", "md", "lg"] as const).map((size) => (
        <EmptyState
          key={size}
          size={size}
          icon="search"
          title="No matching results"
          description="Nothing matches that search. Try a shorter or different phrase."
          actions={<Button intent="secondary" size={size === "lg" ? "md" : "sm"}>Clear search</Button>}
        />
      ))}
    </div>
  ),
};

/** The `media` slot takes anything in place of the default icon, such as an illustration or a coloured FeaturedIcon. */
export const CustomMedia: Story = {
  render: () => (
    <EmptyState
      media={<FeaturedIcon icon="circle-check-big" variant="success" size="lg" />}
      title="You're all caught up"
      description="New notifications will appear here."
    />
  ),
};

/** Inside a card, at the small size. */
export const InACard: Story = {
  render: () => (
    <div
      style={{
        width: 360,
        padding: "32px 16px",
        border: "1px solid var(--color-border-secondary)",
        borderRadius: "var(--radius-interactive)",
      }}
    >
      <EmptyState
        size="sm"
        icon="file"
        title="No files"
        description="Files attached to this item appear here."
        actions={<Button size="sm" intent="secondary" icon="upload">Upload</Button>}
      />
    </div>
  ),
};
