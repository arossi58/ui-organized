<!--
  Foundational Icon component — the single interface for rendering icons.

  Reads the active library, style, and stroke adjustment from the nearest
  IconProvider, looks the name up among the icons registered for that library,
  and renders it at the requested size with optical stroke correction when
  enabled. Names are the library's own (`x` in Lucide, `x-mark` in Heroicons). Every decision it makes before rendering is shared with the other
  framework libraries; see `resolveIcon*` in @ui-organized/core.

  Only the icons you register reach the bundle — see ../../icons/registry.ts
  for why the package deliberately imports none of the icon libraries itself:

      import { registerIcons } from "@ui-organized/vue/icons/lucide";
      registerIcons({ Camera, Rocket });   // <Icon name="camera" />
-->
<script setup lang="ts">
import { computed, watchEffect } from "vue";
import { clsx } from "clsx";
import {
  resolveIconStroke,
  resolveIconSvgProps,
  resolveSystemGlyph,
} from "@ui-organized/core";
import { useIconConfig } from "../../context/iconContext.js";
import { glyphOf } from "../../icons/glyph.js";
import {
  getIcon,
  getIconSet,
  registeredLibraries,
  registeredNames,
  type IconSet,
} from "../../icons/registry.js";
import { warnMissingIcon, warnMissingIconSet } from "./warnMissingIconSet.js";
import type { IconProps } from "./Icon.types.js";
import "@ui-organized/core/components/Icon/Icon.css";

const props = withDefaults(defineProps<IconProps>(), { size: 24 });

const config = useIconConfig();

// A supplied component is used as-is, unless it is one of the components' own
// glyphs, which stands in for whichever cut the active library has.
const glyph = computed(() => (typeof props.name === "string" ? undefined : glyphOf(props.name)));
const supplied = computed(() =>
  typeof props.name === "string" || glyph.value ? undefined : props.name,
);

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

const iconComponent = computed(() => {
  if (supplied.value) return supplied.value;
  if (!set.value) return undefined;
  if (glyph.value) return resolveSystemGlyph(set.value, glyph.value, config.value.style);
  return getIcon(set.value.library, props.name as string, config.value.style);
});

watchEffect(() => {
  if (set.value && !iconComponent.value && typeof props.name === "string") {
    warnMissingIcon(set.value.library, props.name, registeredNames(set.value.library));
  }
});

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
