import type { Meta, StoryObj } from "@storybook/react-vite";
import { Carousel } from "@ui-organized/react";

/**
 * Demo slides use the palette's designed `-bg` / `-content` pairs rather than a
 * solid status fill with light text. The solid fills are tuned for icons and
 * chips, not for 20px body copy: `status-success` under `content-light` lands at
 * 3.21:1 and `status-caution` at 2.54:1, both short of AA. The tinted pairs are
 * built to carry text and clear it comfortably.
 */
const slide = (label: string, tone: string, ink: string) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      height: 180,
      background: tone,
      color: ink,
      fontFamily: "var(--type-font-body)",
      fontSize: "var(--type-size-heading-small)",
      fontWeight: "var(--type-weight-heading-emphasis)",
    }}
  >
    {label}
  </div>
);

const SLIDES = [
  {
    id: "1",
    content: slide("One", "var(--color-interactive-primary-default)", "var(--color-content-light)"),
  },
  {
    id: "2",
    content: slide("Two", "var(--color-status-info-bg)", "var(--color-status-info-content)"),
  },
  {
    id: "3",
    content: slide(
      "Three",
      "var(--color-status-success-bg)",
      "var(--color-status-success-content)",
    ),
  },
  {
    id: "4",
    content: slide("Four", "var(--color-status-caution-bg)", "var(--color-status-caution-content)"),
  },
];

const meta: Meta<typeof Carousel> = {
  title: "Components/Data Display/Carousel",
  component: Carousel,
  tags: ["!dev"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "A scroll-snap slide track with previous/next controls and dot indicators. `slideCount` is derived from `slides` rather than passed, so the snap points can never drift from what is rendered. The current indicator widens rather than only changing colour, so position is readable without relying on hue.",
      },
    },
  },
  argTypes: {
    size: { control: "select", options: ["sm", "md", "lg"] },
    variant: { control: "select", options: ["default", "minimal"] },
    slidesPerPage: { control: { type: "range", min: 1, max: 3 } },
  },
};

export default meta;
type Story = StoryObj<typeof Carousel>;

export const Inspect: Story = {
  tags: ["dev"],
  render: (args) => (
    <div style={{ maxWidth: 520 }}>
      <Carousel {...args} />
    </div>
  ),
  args: {
    slides: SLIDES,
    label: "Featured",
    slidesPerPage: 1,
    size: "md",
    variant: "default",
  },
};

export const MultipleSlidesPerPage: Story = {
  render: () => (
    <div style={{ maxWidth: 520 }}>
      <Carousel slides={SLIDES} label="Featured" slidesPerPage={2} loop />
    </div>
  ),
  parameters: {
    docs: {
      source: {
        code: `<Carousel slides={SLIDES} label="Featured" slidesPerPage={2} loop />`,
      },
    },
  },
};

export const Minimal: Story = {
  render: () => (
    <div style={{ maxWidth: 520 }}>
      <Carousel slides={SLIDES} label="Featured" variant="minimal" />
    </div>
  ),
  parameters: {
    docs: {
      source: {
        code: `{/* Indicators only — for a touch-first surface where swiping is the control. */}
<Carousel slides={SLIDES} label="Featured" variant="minimal" />`,
      },
    },
  },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 32, maxWidth: 520 }}>
      <Carousel slides={SLIDES} size="sm" label="Small" />
      <Carousel slides={SLIDES} size="lg" label="Large" />
    </div>
  ),
  parameters: {
    docs: {
      source: {
        code: `<Carousel slides={SLIDES} size="sm" label="Small" />
<Carousel slides={SLIDES} size="lg" label="Large" />`,
      },
    },
  },
};
