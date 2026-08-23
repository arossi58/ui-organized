<!--
  One node, recursive.

  Its own component because Vue's recursion is component recursion: a template
  cannot call a fragment of itself, and an SFC can name itself by its filename.
  Branch and leaf are different Ark parts — a branch owns the disclosure
  machinery and a leaf does not — so the shape of the node decides which is
  rendered, not a prop.

  The parts themselves take no `node`/`index-path`; `NodeProvider` puts both into
  context and every part below reads from there. That is also what makes the
  recursion work: each level provides its own node, so a child never has to be
  told where its parent sits.
-->
<script setup lang="ts">
import { TreeView as ArkTreeView } from "@ark-ui/vue";
import Icon from "../Icon/Icon.vue";
import type { TreeViewNode } from "./TreeView.types.js";

/** Chevron and node icons stay one step below the text size — they mark the row
 *  rather than compete with it. */
const INDICATOR_SIZE = 16;

// `showIndentGuides` is a Boolean prop, and Vue casts an absent one to `false`
// rather than `undefined` — see ../../props.ts. It is safe without a default
// here only because TreeView always passes it; nothing else constructs a node.
defineProps<{
  node: TreeViewNode;
  indexPath: number[];
  iconSize: number;
  showIndentGuides: boolean;
}>();
</script>

<template>
  <ArkTreeView.NodeProvider :node="node" :index-path="indexPath">
    <ArkTreeView.Branch v-if="node.children?.length" class="tree-view__branch">
      <ArkTreeView.BranchControl class="tree-view__branch-control">
        <ArkTreeView.BranchIndicator class="tree-view__branch-indicator">
          <Icon name="chevron-right" :size="INDICATOR_SIZE" />
        </ArkTreeView.BranchIndicator>
        <Icon :name="node.icon ?? 'folder'" :size="iconSize" class="tree-view__node-icon" />
        <ArkTreeView.BranchText class="tree-view__node-text">
          {{ node.label }}
        </ArkTreeView.BranchText>
      </ArkTreeView.BranchControl>
      <ArkTreeView.BranchContent class="tree-view__branch-content">
        <ArkTreeView.BranchIndentGuide v-if="showIndentGuides" class="tree-view__indent-guide" />
        <TreeNode
          v-for="(child, index) in node.children"
          :key="child.id"
          :node="child"
          :index-path="[...indexPath, index]"
          :icon-size="iconSize"
          :show-indent-guides="showIndentGuides"
        />
      </ArkTreeView.BranchContent>
    </ArkTreeView.Branch>
    <ArkTreeView.Item v-else class="tree-view__item">
      <Icon v-if="node.icon" :name="node.icon" :size="iconSize" class="tree-view__node-icon" />
      <ArkTreeView.ItemText class="tree-view__node-text">{{ node.label }}</ArkTreeView.ItemText>
    </ArkTreeView.Item>
  </ArkTreeView.NodeProvider>
</template>
