import type { Meta, StoryObj } from "@storybook/react-vite";
import { Timer } from "@ui-organized/react";

/** Two hours, in milliseconds. Fixed so the rendered frame is deterministic —
 *  a timer seeded from the clock would make every snapshot differ. */
const TWO_HOURS = 2 * 60 * 60 * 1000;

const meta: Meta<typeof Timer> = {
  title: "Components/Feedback/Timer",
  component: Timer,
  tags: ["!dev"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Counts up or down in whichever units you ask for. Digits are tabular throughout, so the row does not jitter as digit widths change on each tick. Every story starts with `autoStart={false}` — set it to `true` in real use, or drive it from the controls.",
      },
    },
  },
  argTypes: {
    size: { control: "select", options: ["sm", "md", "lg"] },
    variant: { control: "select", options: ["default", "boxed"] },
  },
};

export default meta;
type Story = StoryObj<typeof Timer>;

export const Inspect: Story = {
  tags: ["dev"],
  args: {
    startMs: TWO_HOURS,
    countdown: true,
    autoStart: false,
    showControls: true,
    size: "md",
    variant: "default",
  },
};

export const Boxed: Story = {
  render: () => (
    <Timer startMs={TWO_HOURS} countdown variant="boxed" showLabels autoStart={false} />
  ),
  parameters: {
    docs: {
      source: {
        code: `<Timer startMs={2 * 60 * 60 * 1000} countdown variant="boxed" showLabels autoStart />`,
      },
    },
  },
};

export const WithDays: Story = {
  render: () => (
    <Timer
      parts={["days", "hours", "minutes", "seconds"]}
      startMs={3 * 24 * 60 * 60 * 1000}
      countdown
      variant="boxed"
      showLabels
      autoStart={false}
    />
  ),
  parameters: {
    docs: {
      source: {
        code: `<Timer
  parts={["days", "hours", "minutes", "seconds"]}
  startMs={3 * 24 * 60 * 60 * 1000}
  countdown
  variant="boxed"
  showLabels
  autoStart
/>`,
      },
    },
  },
};

export const CountUp: Story = {
  render: () => <Timer parts={["minutes", "seconds"]} showControls autoStart={false} />,
  parameters: {
    docs: {
      source: {
        code: `{/* No countdown and no startMs — counts up from zero, like a stopwatch. */}
<Timer parts={["minutes", "seconds"]} showControls />`,
      },
    },
  },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <Timer startMs={TWO_HOURS} countdown size="sm" autoStart={false} />
      <Timer startMs={TWO_HOURS} countdown size="md" autoStart={false} />
      <Timer startMs={TWO_HOURS} countdown size="lg" autoStart={false} />
    </div>
  ),
  parameters: {
    docs: {
      source: {
        code: `<Timer startMs={TWO_HOURS} countdown size="sm" />
<Timer startMs={TWO_HOURS} countdown size="md" />
<Timer startMs={TWO_HOURS} countdown size="lg" />`,
      },
    },
  },
};
