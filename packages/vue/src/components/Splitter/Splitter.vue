<script setup lang="ts">
import { computed, useAttrs } from "vue";
import { Splitter as ArkSplitter } from "@ark-ui/vue";
import { clsx } from "clsx";
import { splitterStyles } from "@ui-organized/core";
import { definedOnly } from "../../props.js";
import type { SplitterProps } from "./Splitter.types.js";
import "@ui-organized/core/components/Splitter/Splitter.css";

defineOptions({ inheritAttrs: false });
const props = withDefaults(defineProps<SplitterProps>(), {
  orientation: "horizontal",
});
const emit = defineEmits<{
  "update:size": [size: number[]];
  resize: [size: number[]];
  resizeEnd: [size: number[]];
}>();

const attrs = useAttrs();
const rootClass = computed(() =>
  clsx(
    splitterStyles({ orientation: props.orientation, variant: props.variant }),
    attrs.class as string,
  ),
);

/* The machine takes its own panel descriptors, not our render data — strip
   `content` so a changed component never looks like a changed constraint. */
const panelData = computed(() =>
  props.panels.map(({ id, minSize, maxSize, collapsible, collapsedSize }) => ({
    id,
    minSize,
    maxSize,
    collapsible,
    collapsedSize,
  })),
);

const rootProps = computed(() =>
  definedOnly({ size: props.size, defaultSize: props.defaultSize }),
);

// Written here rather than inline: a Vue template expression cannot carry an
// object type annotation, and the handlers' details argument needs one.
function onResize(details: { size: number[] }) {
  emit("update:size", details.size);
  emit("resize", details.size);
}
function onResizeEnd(details: { size: number[] }) {
  emit("resizeEnd", details.size);
}
const isString = (v: unknown) => typeof v === "string";
</script>

<template>
  <ArkSplitter.Root
    :class="rootClass"
    :panels="panelData"
    v-bind="rootProps"
    :orientation="orientation"
    @resize="onResize"
    @resize-end="onResizeEnd"
  >
    <template v-for="(panel, index) in panels" :key="panel.id">
      <ArkSplitter.Panel :id="panel.id" class="splitter__panel">
        <template v-if="isString(panel.content)">{{ panel.content }}</template>
        <component :is="panel.content" v-else-if="panel.content" />
      </ArkSplitter.Panel>
      <!--
        A handle sits between adjacent panels, so the last panel has none.
        zag identifies it by the literal "before:after" pair of ids.
      -->
      <ArkSplitter.ResizeTrigger
        v-if="index < panels.length - 1"
        :id="`${panel.id}:${panels[index + 1]!.id}`"
        class="splitter__trigger"
      >
        <span class="splitter__grip" aria-hidden="true" />
      </ArkSplitter.ResizeTrigger>
    </template>
  </ArkSplitter.Root>
</template>
