<script setup lang="ts">
import { computed } from "vue";
import { Icon, IconProvider } from "@ui-organized/vue";
import { VUE_STUB_SET } from "./vueIcons.js";
import StubIcon from "./StubIcon.vue";

// Two roots behind a v-if, so the attrs cannot be allowed to fall through on
// their own — the provider branch renders a fragment, and Vue has nowhere to
// put them.
defineOptions({ inheritAttrs: false });

// `supplied` swaps the canonical name for a component handed over directly,
// which is a separate branch in every `Icon`: no registry lookup, no adapter,
// and core's own `{ size, strokeWidth }` fallback instead of the set's
// `svgProps`. The component itself has to come from the fixture, because each
// framework's is its own.
const props = defineProps<{
  provider?: Record<string, unknown>;
  supplied?: boolean;
  name?: string;
}>();

const resolved = computed(() => (props.supplied ? StubIcon : props.name));

/**
 * The cases name the outline/solid prop `style`, as React and Svelte do. Vue
 * reserves that name and cannot receive it — see the note in the package's
 * `IconProvider.vue` — so the fixture renames it, exactly as it renames
 * `className` to `class`. Translating here rather than in the cases keeps the
 * asymmetry in the one place it belongs.
 */
const providerProps = computed(() => {
  const { style, ...rest } = props.provider ?? {};
  return { ...rest, ...(style !== undefined ? { iconStyle: style } : {}) };
});
</script>

<template>
  <!-- The wrapper is load-bearing for one case; see the Icon spec in cases/Icon.tsx. -->
  <div class="icon-probe">
    <IconProvider
      v-if="provider"
      library="lucide"
      icon-style="outline"
      :strokeAdjustment="false"
      :icons="VUE_STUB_SET"
      v-bind="providerProps"
    >
      <Icon :name="resolved" v-bind="$attrs" />
    </IconProvider>
    <Icon v-else :name="resolved" v-bind="$attrs" />
  </div>
</template>
