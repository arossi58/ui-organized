import type { Meta, StoryObj } from "@storybook/react-vite";
import { Icon } from "@ui-organized/react";

const meta: Meta<typeof Icon> = {
  title: "Foundation/Icon",
  component: Icon,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Icon renders a named glyph from the active icon library (set via IconProvider). Choose the glyph with `name`, its pixel `size`, and pass an optional `label` to expose it to assistive tech (otherwise it is treated as decorative).",
      },
    },
  },
  argTypes: {
    name: {
      control: "select",
      options: [
        "chevron-down", "chevron-up", "chevron-left", "chevron-right",
        "arrow-left", "arrow-right", "close", "check", "plus", "minus",
        "copy", "edit", "trash", "download", "upload", "refresh",
        "check-circle", "alert-circle", "alert-triangle", "info", "loader",
        "search", "eye", "eye-off", "user", "users", "lock", "unlock",
        "mail", "phone", "settings", "home", "calendar", "clock",
        "star", "heart", "bookmark", "tag", "menu", "grid", "list",
        "sort-asc", "sort-desc", "filter", "external-link",
        "arrow-up", "arrow-down",
      ],
    },
    size: { control: { type: "range", min: 12, max: 48, step: 2 } },
    label: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof Icon>;

export const Default: Story = {
  args: {
    name: "check-circle",
    size: 24,
  },
};

export const AllIcons: Story = {
  parameters: {
    docs: {
      source: {
        code: `
const names = [
  "chevron-down", "chevron-up", "chevron-left", "chevron-right",
  "arrow-left", "arrow-right", "arrow-up", "arrow-down", "external-link",
  "close", "check", "plus", "minus", "copy", "edit", "trash",
  "download", "upload", "refresh", "sort-asc", "sort-desc", "filter",
  "check-circle", "alert-circle", "alert-triangle", "info", "loader",
  "search", "eye", "eye-off", "bookmark", "star", "heart", "tag",
  "menu", "grid", "list", "user", "users", "lock", "unlock",
  "mail", "phone", "settings", "home", "calendar", "clock",
] as const;

{names.map((name) => (
  <Icon key={name} name={name} size={20} />
))}
`.trim(),
      },
    },
  },
  render: () => {
    const icons = [
      "chevron-down", "chevron-up", "chevron-left", "chevron-right",
      "arrow-left", "arrow-right", "arrow-up", "arrow-down", "external-link",
      "close", "check", "plus", "minus", "copy", "edit", "trash",
      "download", "upload", "refresh", "sort-asc", "sort-desc", "filter",
      "check-circle", "alert-circle", "alert-triangle", "info", "loader",
      "search", "eye", "eye-off", "bookmark", "star", "heart", "tag",
      "menu", "grid", "list", "user", "users", "lock", "unlock",
      "mail", "phone", "settings", "home", "calendar", "clock",
    ] as const;

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
            <span style={{ fontSize: "11px", color: "var(--color-text-text-tertiary)", textAlign: "center", fontFamily: "monospace" }}>
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
          <span style={{ fontSize: "11px", color: "var(--color-text-text-tertiary)" }}>{size}px</span>
        </div>
      ))}
    </div>
  ),
};

export const WithLabel: Story = {
  args: {
    name: "alert-triangle",
    size: 24,
    label: "Warning",
  },
};
