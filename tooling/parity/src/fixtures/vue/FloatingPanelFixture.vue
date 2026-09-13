<script setup lang="ts">
import {
  FloatingPanel,
  FloatingPanelTrigger,
  FloatingPanelContent,
  FloatingPanelHeader,
  FloatingPanelTitle,
  FloatingPanelBody,
  FloatingPanelClose,
} from "@ui-organized/vue";

/** `triggerClass` rather than a nested className — see FloatingPanelFixture.svelte. */
defineProps<{
  triggerProps?: Record<string, unknown>;
  triggerClass?: string;
  contentProps?: Record<string, unknown>;
  bodyClose?: boolean;
}>();
</script>

<template>
  <FloatingPanel v-bind="$attrs">
    <FloatingPanelTrigger :class="triggerClass" v-bind="triggerProps">Open</FloatingPanelTrigger>
    <FloatingPanelContent v-bind="contentProps">
      <FloatingPanelHeader>
        <FloatingPanelTitle>Title</FloatingPanelTitle>
        <FloatingPanelClose />
      </FloatingPanelHeader>
      <FloatingPanelBody>
        Body
        <FloatingPanelClose v-if="bodyClose">Done</FloatingPanelClose>
      </FloatingPanelBody>
    </FloatingPanelContent>
  </FloatingPanel>
</template>
