<script lang="ts">
  import { TreeView as ArkTreeView, createTreeCollection } from "@ark-ui/svelte";
  import { clsx } from "clsx";
  import { CONTROL_ICON_SIZE, treeViewStyles } from "@ui-organized/core";
  import Icon from "../Icon/Icon.svelte";
  import type { TreeViewProps, TreeViewNode } from "./TreeView.types.js";
  import "@ui-organized/core/components/TreeView/TreeView.css";

  /** Chevron and node icons stay one step below the text size — they mark the row
   *  rather than compete with it. */
  const INDICATOR_SIZE = 16;

  let {
    items,
    label,
    selectedValue = $bindable(),
    defaultSelectedValue,
    onSelectionChange,
    expandedValue = $bindable(),
    defaultExpandedValue,
    onExpandedChange,
    selectionMode,
    size = "md",
    variant,
    showIndentGuides = true,
    class: className,
  }: TreeViewProps = $props();

  const iconSize = $derived(CONTROL_ICON_SIZE[size]);

  /* The machine walks a single root node, so `items` is wrapped in a synthetic
     one that is never rendered — Ark starts from its children. Every accessor is
     supplied rather than relying on defaults, so the public node shape (`id` /
     `label`) is ours rather than the collection's.

     `$derived` and not `$state`: the collection is a pure function of `items`,
     and Menubar's MutationObserver trick has no counterpart to solve here. That
     one exists because a snippet is opaque — there is no way to know what a
     caller projected without watching the DOM. A tree is the other case
     entirely: its shape arrives as data, so the recursion below and the
     collection here read the same reactive array and cannot drift apart. */
  const collection = $derived(
    createTreeCollection<TreeViewNode>({
      rootNode: { id: "__root__", label: "", children: items },
      nodeToValue: (node) => node.id,
      nodeToString: (node) => node.label,
      nodeToChildren: (node) => node.children ?? [],
      isNodeDisabled: (node) => !!node.disabled,
    }),
  );
</script>

<!--
  One node, recursive.

  A snippet rather than a child component, because a snippet can call itself and
  a recursive component would have to import its own file — the same nesting for
  a file more. Branch and leaf are different Ark parts (a branch owns the
  disclosure machinery and a leaf does not) so the shape of the node decides
  which is rendered, not a prop.

  The parts themselves take no `node`/`indexPath`; `NodeProvider` puts both into
  context and every part below reads from there. That is also what makes the
  recursion work: each level provides its own node, so a child never has to be
  told where its parent sits.
-->
{#snippet treeNode(node: TreeViewNode, indexPath: number[])}
  <ArkTreeView.NodeProvider {node} {indexPath}>
    {#if node.children?.length}
      <ArkTreeView.Branch class="tree-view__branch">
        <ArkTreeView.BranchControl class="tree-view__branch-control">
          <ArkTreeView.BranchIndicator class="tree-view__branch-indicator">
            <Icon name="chevron-right" size={INDICATOR_SIZE} />
          </ArkTreeView.BranchIndicator>
          <Icon name={node.icon ?? "folder"} size={iconSize} class="tree-view__node-icon" />
          <ArkTreeView.BranchText class="tree-view__node-text">
            {node.label}
          </ArkTreeView.BranchText>
        </ArkTreeView.BranchControl>
        <ArkTreeView.BranchContent class="tree-view__branch-content">
          {#if showIndentGuides}
            <ArkTreeView.BranchIndentGuide class="tree-view__indent-guide" />
          {/if}
          {#each node.children as child, index (child.id)}
            {@render treeNode(child, [...indexPath, index])}
          {/each}
        </ArkTreeView.BranchContent>
      </ArkTreeView.Branch>
    {:else}
      <!--
        The item is pinned to a <div> with asChild: `@ark-ui/svelte` builds this
        part on `ark.li` while `@ark-ui/react` and `@ark-ui/vue` both build it on
        `ark.div`, and one stylesheet styles every framework library. An <li>
        outside a list is also a nesting error in its own right — the tree parts
        around it are divs. The caller's class goes *through* Ark's props
        function rather than being spread after it, so Ark's own attributes
        survive the merge.
      -->
      <ArkTreeView.Item>
        {#snippet asChild(itemProps)}
          <div {...itemProps({ class: "tree-view__item" })}>
            {#if node.icon}
              <Icon name={node.icon} size={iconSize} class="tree-view__node-icon" />
            {/if}
            <ArkTreeView.ItemText class="tree-view__node-text">
              {node.label}
            </ArkTreeView.ItemText>
          </div>
        {/snippet}
      </ArkTreeView.Item>
    {/if}
  </ArkTreeView.NodeProvider>
{/snippet}

<ArkTreeView.Root
  class={clsx(treeViewStyles({ size, variant }), className)}
  {collection}
  bind:selectedValue
  {defaultSelectedValue}
  onSelectionChange={(details) => onSelectionChange?.(details.selectedValue)}
  bind:expandedValue
  {defaultExpandedValue}
  onExpandedChange={(details) => onExpandedChange?.(details.expandedValue)}
  {selectionMode}
>
  {#if label}
    <ArkTreeView.Label class="tree-view__label">{label}</ArkTreeView.Label>
  {/if}
  <ArkTreeView.Tree class="tree-view__tree">
    {#each items as node, index (node.id)}
      {@render treeNode(node, [index])}
    {/each}
  </ArkTreeView.Tree>
</ArkTreeView.Root>
