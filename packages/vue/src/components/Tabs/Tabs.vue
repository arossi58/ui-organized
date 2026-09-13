<script setup lang="ts">
import { computed, useAttrs } from "vue";
import { Tabs as ArkTabs } from "@ark-ui/vue";
import { clsx } from "clsx";
import { tabsStyles } from "@ui-organized/core";
import { definedOnly } from "../../props.js";
import type { TabsProps } from "./Tabs.types.js";
import "@ui-organized/core/components/Tabs/Tabs.css";

defineOptions({ inheritAttrs: false });
const props = withDefaults(defineProps<TabsProps>(), {
  orientation: "horizontal",
  size: "default",
});
const emit = defineEmits<{
  "update:modelValue": [value: string];
  valueChange: [value: string];
}>();

const attrs = useAttrs();
const rootClass = computed(() =>
  clsx(
    tabsStyles({ orientation: props.orientation, size: props.size }),
    attrs.class as string,
  ),
);

// Zag tabs are keyed by string; coerce at the boundary so numeric tab values
// keep working.
const resolvedDefault = computed(() =>
  props.defaultValue != null
    ? String(props.defaultValue)
    : props.tabs[0] != null
      ? String(props.tabs[0].value)
      : undefined,
);
const rootProps = computed(() =>
  definedOnly({
    value: props.modelValue != null ? String(props.modelValue) : undefined,
    defaultValue: resolvedDefault.value,
  }),
);
const isString = (v: unknown) => typeof v === "string";
</script>

<template>
  <ArkTabs.Root
    v-bind="rootProps"
    :orientation="orientation"
    :class="rootClass"
    @value-change="
      (details) => {
        emit('update:modelValue', details.value);
        emit('valueChange', details.value);
      }
    "
  >
    <ArkTabs.List class="tabs__list">
      <ArkTabs.Trigger
        v-for="tab in tabs"
        :key="tab.value"
        :value="String(tab.value)"
        :disabled="tab.disabled"
        class="tabs__tab text-emphasis-body-large"
      >
        <template v-if="isString(tab.label)">{{ tab.label }}</template>
        <component :is="tab.label" v-else />
      </ArkTabs.Trigger>
    </ArkTabs.List>
    <div class="tabs__panels">
      <ArkTabs.Content
        v-for="tab in tabs"
        :key="tab.value"
        :value="String(tab.value)"
        class="tabs__panel"
      >
        <template v-if="isString(tab.content)">{{ tab.content }}</template>
        <component :is="tab.content" v-else />
      </ArkTabs.Content>
    </div>
  </ArkTabs.Root>
</template>
