import type { Meta, StoryObj } from "@storybook/react-vite";
import { Splitter } from "@ui-organized/react";

const pane = (label: string) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      height: "100%",
      background: "var(--color-surface-secondary)",
      color: "var(--color-content-secondary)",
      fontFamily: "var(--type-font-body)",
      fontSize: "var(--type-size-body-medium)",
    }}
  >
    {label}
  </div>
);

const TWO_PANES = [
  { id: "sidebar", content: pane("Sidebar"), minSize: 15, maxSize: 40 },
  { id: "main", content: pane("Main") },
];

const meta: Meta<typeof Splitter> = {
  title: "Components/Layout/Splitter",
  component: Splitter,
  tags: ["!dev"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Resizable panes with a draggable handle between each adjacent pair. Sizes are percentages of the group and the machine owns them, so panels stay in sync as the container resizes. Handles are keyboard-operable — arrow keys resize, and a collapsible panel toggles with Enter.",
      },
    },
  },
  argTypes: {
    orientation: { control: "select", options: ["horizontal", "vertical"] },
    variant: { control: "select", options: ["default", "subtle"] },
  },
};

export default meta;
type Story = StoryObj<typeof Splitter>;

export const Inspect: Story = {
  tags: ["dev"],
  render: (args) => (
    <div style={{ height: 240 }}>
      <Splitter {...args} />
    </div>
  ),
  args: {
    panels: TWO_PANES,
    defaultSize: [25, 75],
    orientation: "horizontal",
    variant: "default",
  },
};

export const Vertical: Story = {
  render: () => (
    <div style={{ height: 320 }}>
      <Splitter
        orientation="vertical"
        panels={[
          { id: "editor", content: pane("Editor") },
          { id: "console", content: pane("Console"), minSize: 20 },
        ]}
        defaultSize={[70, 30]}
      />
    </div>
  ),
  parameters: {
    docs: {
      source: {
        code: `<Splitter
  orientation="vertical"
  panels={[
    { id: "editor",  content: <Editor /> },
    { id: "console", content: <Console />, minSize: 20 },
  ]}
  defaultSize={[70, 30]}
/>`,
      },
    },
  },
};

export const ThreePanes: Story = {
  render: () => (
    <div style={{ height: 240 }}>
      <Splitter
        panels={[
          { id: "nav", content: pane("Nav"), minSize: 10, collapsible: true },
          { id: "list", content: pane("List"), minSize: 20 },
          { id: "detail", content: pane("Detail"), minSize: 20 },
        ]}
        defaultSize={[20, 30, 50]}
      />
    </div>
  ),
  parameters: {
    docs: {
      source: {
        code: `{/* A handle appears between each adjacent pair, so three panels get two. */}
<Splitter
  panels={[
    { id: "nav",    content: <Nav />,    minSize: 10, collapsible: true },
    { id: "list",   content: <List />,   minSize: 20 },
    { id: "detail", content: <Detail />, minSize: 20 },
  ]}
  defaultSize={[20, 30, 50]}
/>`,
      },
    },
  },
};

export const Subtle: Story = {
  render: () => (
    <div style={{ height: 240 }}>
      <Splitter panels={TWO_PANES} defaultSize={[30, 70]} variant="subtle" />
    </div>
  ),
  parameters: {
    docs: {
      source: {
        code: `{/* The rule stays hidden until the handle is hovered or focused. */}
<Splitter panels={TWO_PANES} defaultSize={[30, 70]} variant="subtle" />`,
      },
    },
  },
};
