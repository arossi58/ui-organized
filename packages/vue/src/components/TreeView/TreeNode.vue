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
import { computed } from "vue";
import { TreeView as ArkTreeView, useTreeViewContext } from "@ark-ui/vue";
import Icon from "../Icon/Icon.vue";
import type { TreeViewNode } from "./TreeView.types.js";

/** Chevron and node icons stay one step below the text size — they mark the row
 *  rather than compete with it. */
const INDICATOR_SIZE = 16;

// `showIndentGuides` is a Boolean prop, and Vue casts an absent one to `false`
// rather than `undefined` — see ../../props.ts. It is safe without a default
// here only because TreeView always passes it; nothing else constructs a node.
const props = defineProps<{
  node: TreeViewNode;
  indexPath: number[];
  iconSize: number;
  showIndentGuides: boolean;
}>();

/**
 * Whether this branch is open, read from the machine rather than tracked here.
 *
 * Only used to decide the panel's `data-state` — see the template.
 */
const treeView = useTreeViewContext();
const branchOpen = computed(() => treeView.value.expandedValue.includes(props.node.id));
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
      <!--
        `data-state="open"` is dropped; `data-state="closed"` is kept.

        zag's collapsible content writes
        `"data-state": skip ? undefined : open ? "open" : "closed"`, where `skip`
        is its first-transition guard — and the Ark wrappers disagree about when
        that guard is set. Clicked open, Ark React leaves the panel with no
        `data-state` while Ark Vue writes `"open"`; collapsed, all of them write
        `"closed"`. Angular writes neither, so Svelte and Vue were the odd two out
        on exactly one value.

        Stripped rather than allowed. The gate refuses the allowance and is right
        to: `TreeView.css` does select on `[data-state]`, for
        `.tree-view__branch-indicator`, so an allowance would stop comparing the
        indicator's open/closed state too — which is the whole point of the
        scenario that clicks a branch open.

        An explicit `undefined` attribute is a *removal* in Vue, not a no-op —
        the footgun in ../../props.ts, used here on purpose.

        Delete when Ark Vue and Ark React agree on `skip`.
      -->
      <ArkTreeView.BranchContent
        class="tree-view__branch-content"
        :data-state="branchOpen ? undefined : 'closed'"
      >
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
