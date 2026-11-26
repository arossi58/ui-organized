<!--
  A key, or a shortcut as a row of keys. A key drawn as a symbol carries its
  name as visually hidden text, so a screen reader says "Command K". React's
  Kbd renders the same markup.
-->
<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { detectPlatform, kbdLabels, kbdStyles, type KeyPlatform } from "@ui-organized/core";
import type { KbdProps } from "./Kbd.types.js";
import "@ui-organized/core/components/Kbd/Kbd.css";

const props = withDefaults(defineProps<KbdProps>(), { platform: "auto" });

// `other` until mounted, so the first render matches what the server drew.
const detected = ref<KeyPlatform>("other");
const mounted = ref(false);
onMounted(() => (mounted.value = true));
watch(
  [mounted, () => props.platform],
  () => {
    if (mounted.value && props.platform === "auto") detected.value = detectPlatform();
  },
);
const labels = computed(() =>
  props.keys ? kbdLabels(props.keys, props.platform === "auto" ? detected.value : props.platform) : null,
);
</script>

<template>
  <kbd :class="kbdStyles({ size })"><template v-if="labels"><kbd v-for="(label, i) in labels" :key="i" class="kbd__key"><template v-if="label.glyph === label.name">{{ label.glyph }}</template><template v-else><span aria-hidden="true">{{ label.glyph }}</span><span class="kbd__name">{{ label.name }}</span></template></kbd></template><kbd v-else class="kbd__key"><slot /></kbd></kbd>
</template>
