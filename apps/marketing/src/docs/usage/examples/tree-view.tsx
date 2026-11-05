import { TreeView, type TreeViewNode } from "@ui-organized/react";
import type { UsageExampleSet } from "./types";

const frame = { width: 260 };

const SHALLOW: TreeViewNode[] = [
  {
    id: "reports",
    label: "Reports",
    children: [
      { id: "q1", label: "First quarter", icon: "file" },
      { id: "q2", label: "Second quarter", icon: "file" },
    ],
  },
  { id: "notes", label: "Meeting notes", icon: "file" },
];

const DEEP_CHAIN: TreeViewNode[] = [
  {
    id: "a",
    label: "Archive",
    children: [
      {
        id: "b",
        label: "Old",
        children: [
          {
            id: "c",
            label: "Reports",
            children: [
              { id: "d", label: "Quarterly", children: [{ id: "e", label: "First quarter", icon: "file" }] },
            ],
          },
        ],
      },
    ],
  },
];

const NAMED: TreeViewNode[] = [
  { id: "drafts", label: "Drafts", children: [{ id: "d1", label: "Launch plan", icon: "file" }] },
  { id: "published", label: "Published", children: [{ id: "p1", label: "Style guide", icon: "file" }] },
  { id: "archived", label: "Archived", children: [{ id: "a1", label: "Old roadmap", icon: "file" }] },
];

const GENERIC: TreeViewNode[] = [
  { id: "g1", label: "Group 1", children: [{ id: "d1", label: "Launch plan", icon: "file" }] },
  { id: "g2", label: "Group 2", children: [{ id: "p1", label: "Style guide", icon: "file" }] },
  { id: "g3", label: "Group 3", children: [{ id: "a1", label: "Old roadmap", icon: "file" }] },
];

const NESTED: TreeViewNode[] = [
  {
    id: "src",
    label: "src",
    children: [
      {
        id: "components",
        label: "components",
        children: [
          { id: "button", label: "Button.tsx", icon: "file" },
          { id: "input", label: "Input.tsx", icon: "file" },
        ],
      },
      { id: "index", label: "index.ts", icon: "file" },
    ],
  },
  { id: "readme", label: "README.md", icon: "file" },
];

export const treeViewExamples: UsageExampleSet = {
  shallow: {
    Do: () => (
      <div style={frame}>
        <TreeView label="Documents" items={SHALLOW} defaultExpandedValue={["reports"]} size="sm" />
      </div>
    ),
    // Four opens, each revealing a single child, to reach one file.
    Dont: () => (
      <div style={frame}>
        <TreeView label="Documents" items={DEEP_CHAIN} defaultExpandedValue={["a", "b", "c", "d"]} size="sm" />
      </div>
    ),
  },

  "branch-names": {
    Do: () => (
      <div style={frame}>
        <TreeView label="Documents" items={NAMED} size="sm" />
      </div>
    ),
    // Nothing says what each group holds, so every branch has to be opened.
    Dont: () => (
      <div style={frame}>
        <TreeView label="Documents" items={GENERIC} size="sm" />
      </div>
    ),
  },

  "indent-guides": {
    Do: () => (
      <div style={frame}>
        <TreeView label="Project files" items={NESTED} defaultExpandedValue={["src", "components"]} size="sm" />
      </div>
    ),
    // Without the rules, which folder index.ts sits in is guesswork.
    Dont: () => (
      <div style={frame}>
        <TreeView
          label="Project files"
          items={NESTED}
          defaultExpandedValue={["src", "components"]}
          size="sm"
          showIndentGuides={false}
        />
      </div>
    ),
  },
};
