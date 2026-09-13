<script setup lang="ts">
import { computed, useAttrs } from "vue";
import { TreeView as ArkTreeView, createTreeCollection } from "@ark-ui/vue";
import { clsx } from "clsx";
import { CONTROL_ICON_SIZE, treeViewStyles } from "@ui-organized/core";
import { definedOnly } from "../../props.js";
import TreeNode from "./TreeNode.vue";
import type { TreeViewProps, TreeViewNode } from "./TreeView.types.js";
import "@ui-organized/core/components/TreeView/TreeView.css";

defineOptions({ inheritAttrs: false });
// `showIndentGuides` defaults to true, which Vue's Boolean cast would get wrong
// — an absent prop becomes `false`, not `undefined`. See ../../props.ts.
const props = withDefaults(defineProps<TreeViewProps>(), {
  size: "md",
  showIndentGuides: true,
});
const emit = defineEmits<{
  "update:selectedValue": [value: string[]];
  selectionChange: [value: string[]];
  "update:expandedValue": [value: string[]];
  expandedChange: [value: string[]];
}>();

const attrs = useAttrs();
const rootClass = computed(() =>
  clsx(treeViewStyles({ size: props.size, variant: props.variant }), attrs.class as string),
);
const iconSize = computed(() => CONTROL_ICON_SIZE[props.size]);

/* The machine walks a single root node, so `items` is wrapped in a synthetic one
   that is never rendered — Ark starts from its children. Every accessor is
   supplied rather than relying on defaults, so the public node shape (`id` /
   `label`) is ours rather than the collection's. */
const collection = computed(() =>
  createTreeCollection<TreeViewNode>({
    rootNode: { id: "__root__", label: "", children: props.items },
    nodeToValue: (node) => node.id,
    nodeToString: (node) => node.label,
    nodeToChildren: (node) => node.children ?? [],
    isNodeDisabled: (node) => !!node.disabled,
  }),
);

const rootProps = computed(() =>
  definedOnly({
    selectedValue: props.selectedValue,
    defaultSelectedValue: props.defaultSelectedValue,
    expandedValue: props.expandedValue,
    defaultExpandedValue: props.defaultExpandedValue,
    selectionMode: props.selectionMode,
  }),
);

// Written here rather than inline: a Vue template expression cannot carry an
// object type annotation, and the handlers' details argument needs one.
function onSelectionChange(details: { selectedValue: string[] }) {
  emit("update:selectedValue", details.selectedValue);
  emit("selectionChange", details.selectedValue);
}
function onExpandedChange(details: { expandedValue: string[] }) {
  emit("update:expandedValue", details.expandedValue);
  emit("expandedChange", details.expandedValue);
}
</script>

<template>
  <ArkTreeView.Root
    :class="rootClass"
    :collection="collection"
    v-bind="rootProps"
    @selection-change="onSelectionChange"
    @expanded-change="onExpandedChange"
  >
    <ArkTreeView.Label v-if="label" class="tree-view__label">{{ label }}</ArkTreeView.Label>
    <ArkTreeView.Tree class="tree-view__tree">
      <TreeNode
        v-for="(node, index) in items"
        :key="node.id"
        :node="node"
        :index-path="[index]"
        :icon-size="iconSize"
        :show-indent-guides="showIndentGuides"
      />
    </ArkTreeView.Tree>
  </ArkTreeView.Root>
</template>
