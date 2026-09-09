import type { Meta, StoryObj } from "@storybook/react-vite";
import { Marquee, Tag } from "@ui-organized/react";

const LOGOS = ["Acme", "Globex", "Initech", "Umbrella", "Soylent", "Hooli"].map((name) => ({
  id: name,
  content: (
    <span
      style={{
        fontFamily: "var(--type-font-body)",
        fontSize: "var(--type-size-body-large)",
        fontWeight: "var(--type-weight-body-strong)",
        color: "var(--color-content-secondary)",
        whiteSpace: "nowrap",
      }}
    >
      {name}
    </span>
  ),
}));

const TAGS = ["React", "TypeScript", "Vite", "Storybook", "Playwright"].map((name) => ({
  id: name,
  content: <Tag variant="info">{name}</Tag>,
}));

const meta: Meta<typeof Marquee> = {
  title: "Components/Data Display/Marquee",
  component: Marquee,
  tags: ["!dev"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Continuously scrolling content — logo walls, ticker rows. Timing is measured from the content rather than fixed, so short and long lists travel at the same speed. Every story here starts paused: continuous motion with no way to stop it fails WCAG 2.2.2, and the animation is dropped entirely under `prefers-reduced-motion`.",
      },
    },
  },
  argTypes: {
    orientation: { control: "select", options: ["horizontal", "vertical"] },
    speed: { control: { type: "range", min: 10, max: 200 } },
  },
};

export default meta;
type Story = StoryObj<typeof Marquee>;

export const Inspect: Story = {
  tags: ["dev"],
  args: {
    items: LOGOS,
    speed: 50,
    orientation: "horizontal",
    // Paused so the rendered frame is deterministic — the visual suite freezes
    // CSS animations but not the measurement pass that sets their duration.
    defaultPaused: true,
    pauseOnInteraction: true,
  },
};

export const PauseOnHover: Story = {
  render: () => <Marquee items={TAGS} pauseOnInteraction defaultPaused speed={40} />,
  parameters: {
    docs: {
      source: {
        code: `{/* pauseOnInteraction gives people a way to stop the motion — WCAG 2.2.2. */}
<Marquee items={TAGS} pauseOnInteraction speed={40} />`,
      },
    },
  },
};

export const Reverse: Story = {
  render: () => <Marquee items={LOGOS} reverse defaultPaused pauseOnInteraction />,
  parameters: {
    docs: {
      source: { code: `<Marquee items={LOGOS} reverse pauseOnInteraction />` },
    },
  },
};

export const WithoutEdges: Story = {
  render: () => <Marquee items={LOGOS} showEdges={false} defaultPaused pauseOnInteraction />,
  parameters: {
    docs: {
      source: {
        code: `{/* Drop the fade when the marquee sits on a surface it can't blend into. */}
<Marquee items={LOGOS} showEdges={false} pauseOnInteraction />`,
      },
    },
  },
};
