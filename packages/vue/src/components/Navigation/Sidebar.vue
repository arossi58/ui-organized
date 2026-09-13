<!--
  The sidebar shell: a logo region, a scrollable nav landmark, and a footer that
  can carry the collapse toggle.

  Ark UI has no Navigation primitive, so everything here — the landmark, the
  controlled/uncontrolled collapse, the rail shared with descendants — is the
  facade's own.
-->
<script setup lang="ts">
import { computed, ref, useAttrs } from "vue";
import { clsx } from "clsx";
import Icon from "../Icon/Icon.vue";
import { provideNavContext } from "./navContext.js";
import type { SidebarProps } from "./Navigation.types.js";
import "@ui-organized/core/components/Navigation/Navigation.css";

const TOGGLE_ICON_SIZE = 20;

defineOptions({ inheritAttrs: false });
// `collapsed` must default to `undefined`, not `false`: Vue casts an absent
// Boolean prop, and a cast `false` reads as "controlled and expanded" — a
// sidebar whose own toggle does nothing. See ../../props.ts.
const props = withDefaults(defineProps<SidebarProps>(), {
  navLabel: "Primary",
  collapsible: false,
  collapsed: undefined,
  defaultCollapsed: false,
});
const emit = defineEmits<{
  "update:collapsed": [collapsed: boolean];
  collapsedChange: [collapsed: boolean];
}>();
const slots = defineSlots<{
  default?: () => unknown;
  /** Logo / wordmark pinned to the top. */
  logo?: () => unknown;
  /**
   * Compact mark shown when collapsed. Falls back to `logo` when omitted.
   *
   * Both spellings are accepted below, because a slot name is matched verbatim:
   * a consumer who writes `#logo-collapsed` — the kebab-case habit templates
   * encourage — would otherwise get no error and a full wordmark crammed into a
   * 56px rail.
   */
  logoCollapsed?: () => unknown;
  "logo-collapsed"?: () => unknown;
  /** Footer region pinned to the bottom, above the collapse toggle. */
  footer?: () => unknown;
}>();
const attrs = useAttrs();

const internalCollapsed = ref(props.defaultCollapsed);
const isCollapsed = computed(() => props.collapsed ?? internalCollapsed.value);

provideNavContext(computed(() => ({ collapsed: isCollapsed.value })));

const toggle = () => {
  const next = !isCollapsed.value;
  if (props.collapsed === undefined) internalCollapsed.value = next;
  emit("update:collapsed", next);
  emit("collapsedChange", next);
};

const collapsedLogoSlot = computed(() => (slots.logoCollapsed ? "logoCollapsed" : "logo-collapsed"));
const hasCollapsedLogo = computed(() => Boolean(slots.logoCollapsed || slots["logo-collapsed"]));
const hasLogo = computed(() => Boolean(slots.logo) || hasCollapsedLogo.value);
const showFooter = computed(() => Boolean(slots.footer) || props.collapsible);
const rootClass = computed(() =>
  clsx("sidebar", isCollapsed.value && "sidebar--collapsed", attrs.class as string),
);
</script>

<template>
  <div :class="rootClass" v-bind="{ ...$attrs, class: undefined }">
    <div v-if="hasLogo" class="sidebar__logo">
      <!-- A rail has room for a mark but not a wordmark; fall back when there is no compact one. -->
      <slot v-if="isCollapsed && hasCollapsedLogo" :name="collapsedLogoSlot" />
      <slot v-else name="logo" />
    </div>

    <nav class="sidebar__nav" :aria-label="navLabel"><slot /></nav>

    <div v-if="showFooter" class="sidebar__footer">
      <div v-if="$slots.footer" class="sidebar__footer-content"><slot name="footer" /></div>
      <button
        v-if="collapsible"
        type="button"
        class="sidebar__toggle text-default-body-medium"
        :aria-expanded="!isCollapsed"
        :aria-label="isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'"
        :title="isCollapsed ? 'Expand' : 'Collapse'"
        @click="toggle"
      >
        <Icon
          :name="isCollapsed ? 'chevron-right' : 'chevron-left'"
          :size="TOGGLE_ICON_SIZE"
          class="sidebar__toggle-icon"
        />
        <span class="sidebar__toggle-label">{{ isCollapsed ? "Expand" : "Collapse" }}</span>
      </button>
    </div>
  </div>
</template>
