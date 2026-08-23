<!--
  A scrollable container with a custom, themed scrollbar. Give the Root a bounded
  height so its content can overflow.

  ── The height is an attribute, not a prop ───────────────────────────────────

  The React library takes `style` for exactly this. Vue cannot declare a prop
  called `style`: the template compiler parses the value into a style *object*
  before props resolve, so it never arrives intact (see ../../context/
  IconProvider.vue, where the same reservation forced a rename). Nothing needs
  renaming here — `style` and `class` fall through to the Root as ordinary
  attributes, which is how a Vue consumer would write it anyway:

  ```vue
  <ScrollArea style="height: 200px">…</ScrollArea>
  <ScrollArea class="notes-pane">…</ScrollArea>
  ```
-->
<script setup lang="ts">
import { computed, useAttrs } from "vue";
import { ScrollArea as ArkScrollArea } from "@ark-ui/vue";
import { clsx } from "clsx";
import type { ScrollAreaProps } from "./ScrollArea.types.js";
import "@ui-organized/core/components/ScrollArea/ScrollArea.css";

defineOptions({ inheritAttrs: false });
const props = withDefaults(defineProps<ScrollAreaProps>(), { orientation: "vertical" });
const attrs = useAttrs();
const rootClass = computed(() => clsx("scroll-area", attrs.class as string));
const showVertical = computed(
  () => props.orientation === "vertical" || props.orientation === "both",
);
const showHorizontal = computed(
  () => props.orientation === "horizontal" || props.orientation === "both",
);
</script>

<template>
  <ArkScrollArea.Root :class="rootClass" v-bind="{ ...$attrs, class: undefined }">
    <!--
      The viewport is the element that scrolls, and a pointer drag is the only
      way to reach content below the fold unless it can take focus. Content that
      is itself focusable (links, inputs) makes this redundant but harmless;
      content that isn't — prose, a long table — depends on it.
    -->
    <ArkScrollArea.Viewport class="scroll-area__viewport" :tabindex="0">
      <ArkScrollArea.Content class="scroll-area__content"><slot /></ArkScrollArea.Content>
    </ArkScrollArea.Viewport>
    <ArkScrollArea.Scrollbar
      v-if="showVertical"
      orientation="vertical"
      class="scroll-area__scrollbar"
    >
      <ArkScrollArea.Thumb class="scroll-area__thumb" />
    </ArkScrollArea.Scrollbar>
    <ArkScrollArea.Scrollbar
      v-if="showHorizontal"
      orientation="horizontal"
      class="scroll-area__scrollbar"
    >
      <ArkScrollArea.Thumb class="scroll-area__thumb" />
    </ArkScrollArea.Scrollbar>
    <ArkScrollArea.Corner v-if="orientation === 'both'" class="scroll-area__corner" />
  </ArkScrollArea.Root>
</template>
