<script setup lang="ts">
import { onMounted, onUnmounted, shallowRef, useAttrs } from "vue";
import { Combobox } from "@ui-organized/vue";
import { OPTIONS_ARRIVE_AFTER } from "../comboboxAsync.js";

// See comboboxAsync.ts. Everything but the options passes straight through,
// the way the SSR gate's own Vue fixtures take their props.
defineOptions({ inheritAttrs: false });
const props = withDefaults(defineProps<{ options?: { value: string; label: string }[] }>(), {
  options: () => [],
});
const attrs = useAttrs();

const loaded = shallowRef<{ value: string; label: string }[]>([]);
let timer: ReturnType<typeof setTimeout> | undefined;
onMounted(() => {
  timer = setTimeout(() => (loaded.value = props.options), OPTIONS_ARRIVE_AFTER);
});
onUnmounted(() => clearTimeout(timer));
</script>

<template>
  <Combobox v-bind="attrs" :options="loaded" />
</template>
