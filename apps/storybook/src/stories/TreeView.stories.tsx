import type { Meta, StoryObj } from "@storybook/react-vite";
import { TreeView } from "@ui-organized/react";

const FILE_TREE = [
  {
    id: "src",
    label: "src",
    children: [
      {
        id: "components",
        label: "components",
        children: [
          { id: "button.tsx", label: "Button.tsx", icon: "file" as const },
          { id: "input.tsx", label: "Input.tsx", icon: "file" as const },
        ],
      },
      { id: "index.ts", label: "index.ts", icon: "file" as const },
    ],
  },
  {
    id: "docs",
    label: "docs",
    children: [{ id: "readme.md", label: "README.md", icon: "file" as const }],
  },
  { id: "package.json", label: "package.json", icon: "file" as const },
];

const meta: Meta<typeof TreeView> = {
  title: "Components/Data Display/TreeView",
  component: TreeView,
  tags: ["!dev"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Nested, expandable rows — file trees, category hierarchies, org charts. A node with `children` renders as a branch and gets the disclosure machinery; one without renders as a leaf. Indentation comes from the machine's own depth, so arbitrarily deep trees stay aligned.",
      },
    },
  },
  argTypes: {
    size: { control: "select", options: ["sm", "md", "lg"] },
    variant: { control: "select", options: ["default", "bordered"] },
    selectionMode: { control: "select", options: ["single", "multiple"] },
  },
};

export default meta;
type Story = StoryObj<typeof TreeView>;

export const Inspect: Story = {
  tags: ["dev"],
  render: (args) => (
    <div style={{ width: 320 }}>
      <TreeView {...args} />
    </div>
  ),
  args: {
    label: "Project files",
    items: FILE_TREE,
    defaultExpandedValue: ["src"],
    size: "md",
    variant: "bordered",
    selectionMode: "single",
  },
};

export const Expanded: Story = {
  render: () => (
    <div style={{ width: 320 }}>
      <TreeView
        label="Project files"
        items={FILE_TREE}
        defaultExpandedValue={["src", "components", "docs"]}
        defaultSelectedValue={["button.tsx"]}
        variant="bordered"
      />
    </div>
  ),
  parameters: {
    docs: {
      source: {
        code: `<TreeView
  label="Project files"
  items={FILE_TREE}
  defaultExpandedValue={["src", "components", "docs"]}
  defaultSelectedValue={["button.tsx"]}
  variant="bordered"
/>`,
      },
    },
  },
};

export const MultiSelect: Story = {
  render: () => (
    <div style={{ width: 320 }}>
      <TreeView
        label="Select files"
        items={FILE_TREE}
        selectionMode="multiple"
        defaultExpandedValue={["src", "components"]}
        defaultSelectedValue={["button.tsx", "index.ts"]}
        variant="bordered"
      />
    </div>
  ),
  parameters: {
    docs: {
      source: {
        code: `<TreeView
  label="Select files"
  items={FILE_TREE}
  selectionMode="multiple"
  defaultExpandedValue={["src", "components"]}
  defaultSelectedValue={["button.tsx", "index.ts"]}
  variant="bordered"
/>`,
      },
    },
  },
};

export const WithoutIndentGuides: Story = {
  render: () => (
    <div style={{ width: 320 }}>
      <TreeView
        items={FILE_TREE}
        defaultExpandedValue={["src", "components"]}
        showIndentGuides={false}
      />
    </div>
  ),
  parameters: {
    docs: {
      source: {
        code: `<TreeView
  items={FILE_TREE}
  defaultExpandedValue={["src", "components"]}
  showIndentGuides={false}
/>`,
      },
    },
  },
};
