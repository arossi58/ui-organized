import type { Meta, StoryObj } from "@storybook/react-vite";
import { Kbd } from "@ui-organized/react";

/**
 * `platform` is pinned in every story: `auto` follows the machine rendering
 * it, so a baseline taken on a Mac and one taken on Linux would both be right
 * and never match.
 */
const meta: Meta<typeof Kbd> = {
  title: "Components/Data Display/Kbd",
  component: Kbd,
  tags: ["!dev"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "A key, or a shortcut as a row of keys. `mod` is ⌘ on a Mac and Ctrl elsewhere.",
      },
    },
  },
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md"] },
    platform: { control: "inline-radio", options: ["auto", "mac", "other"] },
  },
};

export default meta;
type Story = StoryObj<typeof Kbd>;

export const Inspect: Story = {
  tags: ["dev"],
  args: { keys: ["mod", "k"], size: "md", platform: "mac" },
};

/** The same shortcuts on each platform. */
export const Platforms: Story = {
  render: () => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "auto auto",
        gap: "12px 24px",
        alignItems: "center",
      }}
    >
      {[
        ["mod", "k"],
        ["mod", "shift", "p"],
        ["shift", "enter"],
        ["alt", "up"],
      ].map((keys) => (
        <div key={keys.join("+")} style={{ display: "contents" }}>
          <Kbd keys={keys} platform="mac" />
          <Kbd keys={keys} platform="other" />
        </div>
      ))}
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
      <Kbd keys={["mod", "k"]} size="sm" platform="mac" />
      <Kbd keys={["mod", "k"]} size="md" platform="mac" />
      <Kbd size="sm">Esc</Kbd>
      <Kbd>F5</Kbd>
    </div>
  ),
};

/** `sm` sits on the line beside body text. */
export const InText: Story = {
  render: () => (
    <p className="text-default-body-medium" style={{ margin: 0 }}>
      Press <Kbd keys={["mod", "k"]} size="sm" platform="mac" /> to search, or{" "}
      <Kbd keys={["esc"]} size="sm" platform="mac" /> to close.
    </p>
  ),
};
