import type { Meta, StoryObj } from "@storybook/react-vite";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@ui-organized/react";

const meta: Meta<typeof HoverCard> = {
  title: "Components/Overlay/HoverCard",
  component: HoverCard,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A rich preview shown when a trigger is hovered or focused. Compose `<HoverCard>` with `<HoverCardTrigger>` and `<HoverCardContent>` (side/align/showArrow).",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof HoverCard>;

export const Default: Story = {
  render: () => (
    <HoverCard>
      <HoverCardTrigger
        render={
          <a href="#" style={{ color: "var(--color-interactive-primary-default)" }}>
            @ui-organized
          </a>
        }
      />
      <HoverCardContent showArrow>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <strong>ui-organized</strong>
          <span style={{ color: "var(--color-text-text-secondary)" }}>
            An accessible React design system built on Base UI.
          </span>
        </div>
      </HoverCardContent>
    </HoverCard>
  ),
};
