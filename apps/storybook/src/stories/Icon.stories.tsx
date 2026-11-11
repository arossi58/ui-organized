import type { Meta, StoryObj } from "@storybook/react-vite";
import { Icon } from "@ui-organized/react";
import { STORY_ICON_NAMES } from "../storyIcons";

const meta: Meta<typeof Icon> = {
  title: "Foundation/Icon",
  component: Icon,
  tags: ["!dev"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Renders an icon from your icon library, by the library's own name. Pass a `label` when the icon carries meaning; without one it's hidden from assistive tech.",
      },
    },
  },
  argTypes: {
    name: {
      control: "select",
      options: [...STORY_ICON_NAMES],
    },
    size: { control: { type: "range", min: 12, max: 48, step: 2 } },
    label: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof Icon>;

export const Inspect: Story = {
  tags: ["dev"],
  args: {
    name: "circle-check-big",
    size: 24,
  },
};

export const AllIcons: Story = {
  parameters: {
    docs: {
      source: {
        code: `
import { registerIcons } from "@ui-organized/react/icons/lucide";
import { ChevronDown, X, Check /* … */ } from "lucide-react";

registerIcons({ ChevronDown, X, Check /* … */ });

const names = ["chevron-down", "x", "check" /* … */];

{names.map((name) => (
  <Icon key={name} name={name} size={20} />
))}
`.trim(),
      },
    },
  },
  render: () => {
    const icons = STORY_ICON_NAMES;

    return (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: "16px" }}>
        {icons.map((name) => (
          <div
            key={name}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "6px",
              padding: "12px 8px",
            }}
          >
            <Icon name={name} size={20} />
            <span style={{ fontSize: "11px", color: "var(--color-content-tertiary)", textAlign: "center", fontFamily: "monospace" }}>
              {name}
            </span>
          </div>
        ))}
      </div>
    );
  },
};

export const Sizes: Story = {
  parameters: {
    docs: {
      source: {
        code: `
{[12, 16, 20, 24, 32, 40, 48].map((size) => (
  <Icon key={size} name="star" size={size} />
))}
`.trim(),
      },
    },
  },
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
      {[12, 16, 20, 24, 32, 40, 48].map((size) => (
        <div key={size} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
          <Icon name="star" size={size} />
          <span style={{ fontSize: "11px", color: "var(--color-content-tertiary)" }}>{size}px</span>
        </div>
      ))}
    </div>
  ),
};

export const WithLabel: Story = {
  args: {
    name: "triangle-alert",
    size: 24,
    label: "Warning",
  },
};
