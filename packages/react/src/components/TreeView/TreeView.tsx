import { useMemo } from "react";
import { TreeView as ArkTreeView, createTreeCollection } from "@ark-ui/react";
import { clsx } from "clsx";
import { Icon } from "../Icon/index.js";
import { CONTROL_ICON_SIZE, type ControlSize } from "../controlSize.js";
import { treeViewStyles } from "./TreeView.styles.js";
import type { TreeViewProps, TreeViewNode } from "./TreeView.types.js";
import "./TreeView.css";

/** Chevron and node icons stay one step below the text size — they mark the row
 *  rather than compete with it. */
const INDICATOR_SIZE = 16;

interface NodeRenderProps {
  node: TreeViewNode;
  indexPath: number[];
  iconSize: number;
  showIndentGuides: boolean;
}

/**
 * One node, recursive. Branch and leaf are different Ark parts — a branch owns
 * the disclosure machinery and a leaf does not — so the shape of the node
 * decides which is rendered, not a prop.
 *
 * The parts themselves take no `node`/`indexPath`; `NodeProvider` puts both into
 * context and every part below reads from there. That is also what makes the
 * recursion work: each level provides its own node, so a child never has to be
 * told where its parent sits.
 */
function TreeNode({ node, indexPath, iconSize, showIndentGuides }: NodeRenderProps) {
  const isBranch = !!node.children?.length;

  if (!isBranch) {
    return (
      <ArkTreeView.NodeProvider node={node} indexPath={indexPath}>
        <ArkTreeView.Item className="tree-view__item">
          {node.icon && <Icon name={node.icon} size={iconSize} className="tree-view__node-icon" />}
          <ArkTreeView.ItemText className="tree-view__node-text">{node.label}</ArkTreeView.ItemText>
        </ArkTreeView.Item>
      </ArkTreeView.NodeProvider>
    );
  }

  return (
    <ArkTreeView.NodeProvider node={node} indexPath={indexPath}>
      <ArkTreeView.Branch className="tree-view__branch">
        <ArkTreeView.BranchControl className="tree-view__branch-control">
          <ArkTreeView.BranchIndicator className="tree-view__branch-indicator">
            <Icon name="chevron-right" size={INDICATOR_SIZE} />
          </ArkTreeView.BranchIndicator>
          <Icon name={node.icon ?? "folder"} size={iconSize} className="tree-view__node-icon" />
          <ArkTreeView.BranchText className="tree-view__node-text">
            {node.label}
          </ArkTreeView.BranchText>
        </ArkTreeView.BranchControl>
        <ArkTreeView.BranchContent className="tree-view__branch-content">
          {showIndentGuides && (
            <ArkTreeView.BranchIndentGuide className="tree-view__indent-guide" />
          )}
          {node.children!.map((child, index) => (
            <TreeNode
              key={child.id}
              node={child}
              indexPath={[...indexPath, index]}
              iconSize={iconSize}
              showIndentGuides={showIndentGuides}
            />
          ))}
        </ArkTreeView.BranchContent>
      </ArkTreeView.Branch>
    </ArkTreeView.NodeProvider>
  );
}

export function TreeView({
  items,
  label,
  selectedValue,
  defaultSelectedValue,
  onSelectionChange,
  expandedValue,
  defaultExpandedValue,
  onExpandedChange,
  selectionMode,
  size = "md",
  variant,
  showIndentGuides = true,
  className,
}: TreeViewProps) {
  const iconSize = CONTROL_ICON_SIZE[size as ControlSize];

  /* The machine walks a single root node, so `items` is wrapped in a synthetic
     one that is never rendered — Ark starts from its children. Every accessor is
     supplied rather than relying on defaults, so the public node shape (`id` /
     `label`) is ours rather than the collection's. */
  const collection = useMemo(
    () =>
      createTreeCollection<TreeViewNode>({
        rootNode: { id: "__root__", label: "", children: items },
        nodeToValue: (node) => node.id,
        nodeToString: (node) => node.label,
        nodeToChildren: (node) => node.children ?? [],
        isNodeDisabled: (node) => !!node.disabled,
      }),
    [items],
  );

  return (
    <ArkTreeView.Root
      className={clsx(treeViewStyles({ size, variant }), className)}
      collection={collection}
      selectedValue={selectedValue}
      defaultSelectedValue={defaultSelectedValue}
      // Passed unconditionally, not as `onSelectionChange && (…)`. Ark's Root is
      // generic in the node type, and a `fn | undefined` union at this position
      // defeats inference of that type parameter — the collection then resolves
      // to `TreeCollection<unknown>` and stops matching.
      onSelectionChange={(details) => onSelectionChange?.(details.selectedValue)}
      expandedValue={expandedValue}
      defaultExpandedValue={defaultExpandedValue}
      onExpandedChange={(details) => onExpandedChange?.(details.expandedValue)}
      selectionMode={selectionMode}
    >
      {label && <ArkTreeView.Label className="tree-view__label">{label}</ArkTreeView.Label>}
      <ArkTreeView.Tree className="tree-view__tree">
        {items.map((node, index) => (
          <TreeNode
            key={node.id}
            node={node}
            indexPath={[index]}
            iconSize={iconSize}
            showIndentGuides={showIndentGuides}
          />
        ))}
      </ArkTreeView.Tree>
    </ArkTreeView.Root>
  );
}
