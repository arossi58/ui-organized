import type { Meta, StoryObj } from "@storybook/react-vite";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@ui-organized/react";

const meta: Meta<typeof HoverCard> = {
  title: "Components/Overlay/HoverCard",
  component: HoverCard,
  tags: ["!dev"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A rich preview shown when a trigger is hovered or focused. Compose `<HoverCard>` with `<HoverCardTrigger>` and `<HoverCardContent>` (side/align).",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof HoverCard>;

export const Inspect: Story = {
  tags: ["dev"],
  render: (args) => (
    <HoverCard {...args}>
      {/* No inline colour on the trigger: `interactive-primary-default` is a
          fill token, and as 16px text on the default surface it reads 4.22:1 —
          just under AA. It inherits the page's content colour instead, which is
          what body text is toned for. */}
      <HoverCardTrigger
        render={<a href="https://github.com/arossi58/ui-organized">@ui-organized</a>}
      />
      <HoverCardContent>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <strong>ui-organized</strong>
          <span style={{ color: "var(--color-content-secondary)" }}>
            An accessible React design system built on Ark UI.
          </span>
        </div>
      </HoverCardContent>
    </HoverCard>
  ),
};
