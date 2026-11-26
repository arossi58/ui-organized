import type { Meta, StoryObj } from "@storybook/react-vite";
import { Spinner } from "@ui-organized/react";

const meta: Meta<typeof Spinner> = {
  title: "Components/Feedback/Spinner",
  component: Spinner,
  tags: ["!dev"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "An indeterminate loading indicator in the current text colour, for a wait whose length and shape are unknown.",
      },
    },
  },
  argTypes: {
    size: { control: "select", options: ["sm", "md", "lg", "xl"] },
    label: { control: "text" },
    decorative: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof Spinner>;

export const Inspect: Story = {
  tags: ["dev"],
  args: { size: "md", label: "Loading" },
};

export const Sizes: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<Spinner size="sm" />
<Spinner size="md" />
<Spinner size="lg" />
<Spinner size="xl" />
`.trim(),
      },
    },
  },
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
      <Spinner size="sm" />
      <Spinner size="md" />
      <Spinner size="lg" />
      <Spinner size="xl" />
    </div>
  ),
};

/** It has no colour of its own: it takes the text colour of whatever it sits in. */
export const InheritsColor: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<span style={{ color: "var(--color-content-secondary)" }}><Spinner /></span>
<span style={{ color: "var(--color-interactive-tertiary-default)" }}><Spinner /></span>
<span style={{ color: "var(--color-status-error-message)" }}><Spinner /></span>
`.trim(),
      },
    },
  },
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
      <span style={{ color: "var(--color-content-secondary)" }}>
        <Spinner label="Loading activity" />
      </span>
      <span style={{ color: "var(--color-interactive-tertiary-default)" }}>
        <Spinner label="Loading projects" />
      </span>
      <span style={{ color: "var(--color-status-error-message)" }}>
        <Spinner label="Retrying" />
      </span>
    </div>
  ),
};

/** Beside a line of text that says what is happening, the ring is decoration. */
export const WithMessage: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<p role="status" style={{ display: "flex", alignItems: "center", gap: 8 }}>
  <Spinner size="sm" decorative />
  Loading results…
</p>
`.trim(),
      },
    },
  },
  render: () => (
    <p
      role="status"
      className="text-default-body-medium"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        margin: 0,
        color: "var(--color-content-secondary)",
      }}
    >
      <Spinner size="sm" decorative />
      Loading results…
    </p>
  ),
};

/** A region loading on its own: the xl ring, centred in the space the content will fill. */
export const RegionLoading: Story = {
  render: () => (
    <div
      style={{
        display: "grid",
        placeItems: "center",
        width: 360,
        height: 200,
        border: "1px solid var(--color-border-secondary)",
        borderRadius: "var(--radius-interactive)",
        color: "var(--color-content-tertiary)",
      }}
    >
      <Spinner size="xl" label="Loading chart" />
    </div>
  ),
};
