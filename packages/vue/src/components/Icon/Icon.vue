<!--
  Foundational Icon component — the single interface for rendering icons.

  Reads the active library, style, and stroke adjustment from the nearest
  IconProvider, resolves the canonical name against that library's registered
  set, and renders it at the requested size with optical stroke correction when
  enabled. Every decision it makes before rendering is shared with the other
  framework libraries; see `resolveIcon*` in @ui-organized/core.

  The set has to be registered by importing its subpath — see
  ../../icons/registry.ts for why the package deliberately imports none of the
  icon libraries itself:

      import "@ui-organized/vue/icons/lucide";
-->
<script setup lang="ts">
import { computed, watchEffect } from "vue";
import { clsx } from "clsx";
import {
  resolveIconComponent,
  resolveIconStroke,
  resolveIconSvgProps,
} from "@ui-organized/core";
import type { CanonicalIconName } from "@ui-organized/utils";
import { useIconConfig } from "../../context/iconContext.js";
import { getIconSet, registeredLibraries, type IconSet } from "../../icons/registry.js";
import { warnMissingIconSet } from "./warnMissingIconSet.js";
import type { IconProps } from "./Icon.types.js";
import "@ui-organized/core/components/Icon/Icon.css";

const props = withDefaults(defineProps<IconProps>(), { size: 24 });

const config = useIconConfig();

// A directly-supplied component is used as-is — it keeps tree-shaking, needs no
// canonical name, and needs no registered set.
const supplied = computed(() => (typeof props.name === "string" ? undefined : props.name));

// An explicit `icons` on the provider wins; otherwise use whatever the imported
// subpath registered.
const set = computed<IconSet | undefined>(() =>
  supplied.value ? undefined : (config.value.icons ?? getIconSet(config.value.library)),
);

watchEffect(() => {
  // The one failure this structure can introduce: upgrading without adding the
  // subpath import renders nothing at all. Silence would be indefensible, so say
  // exactly what to add. Once per library.
  if (!supplied.value && !set.value) {
    warnMissingIconSet(config.value.library, registeredLibraries());
  }
});

const iconComponent = computed(
  () =>
    supplied.value ??
    resolveIconComponent(set.value, props.name as CanonicalIconName, config.value.style),
);

const svgProps = computed(() =>
  resolveIconSvgProps(
    set.value,
    props.size,
    resolveIconStroke({
      style: config.value.style,
      strokeAdjustment: config.value.strokeAdjustment,
      size: props.size,
      baseStroke: config.value.baseStroke,
      baseSize: config.value.baseSize,
    }),
  ),
);
</script>

<template>
  <span
    v-if="iconComponent"
    :class="clsx('icon', props.class)"
    :aria-label="label"
    :aria-hidden="label ? undefined : true"
    :role="label ? 'img' : undefined"
  >
    <component :is="iconComponent" v-bind="svgProps" />
  </span>
</template>
