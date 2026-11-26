<!-- An application's frame: a header across the top, a sidebar down the side, and the page in a <main> beside it. Slots: `header`, `sidebar`, default. -->
<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, provide, ref, useAttrs, useId, watch } from "vue";
import { clsx } from "clsx";
import {
  APP_SHELL_BREAKPOINT,
  APP_SHELL_CLASS,
  appShellDataLayout,
  appShellNarrowQuery,
  appShellStyles,
  resolveAppShellLayout,
  type AppShellResolvedLayout,
} from "@ui-organized/core";
import Sheet from "../Sheet/Sheet.vue";
import SheetContent from "../Sheet/SheetContent.vue";
import SheetTitle from "../Sheet/SheetTitle.vue";
import SheetSidebarHost from "./SheetSidebarHost.vue";
import { APP_SHELL_KEY } from "./context.js";
import type { AppShellProps } from "./AppShell.types.js";
import "@ui-organized/core/components/Button/Button.css";
import "@ui-organized/core/components/AppShell/AppShell.css";

defineOptions({ inheritAttrs: false });
// `navOpen` defaults to `undefined`, not Vue's cast `false`, which would read as
// "controlled and closed": see ../../props.ts.
const props = withDefaults(defineProps<AppShellProps>(), {
  layout: "auto",
  breakpoint: APP_SHELL_BREAKPOINT,
  navOpen: undefined,
  defaultNavOpen: false,
  navTitle: "Menu",
  scroll: "page",
  skipLinkLabel: "Skip to content",
});
const emit = defineEmits<{
  "update:navOpen": [open: boolean];
  navOpenChange: [open: boolean];
  layoutChange: [layout: AppShellResolvedLayout];
}>();
const slots = defineSlots<{
  default?: () => unknown;
  /** The header across the top, usually an `AppHeader`. */
  header?: () => unknown;
  /** The navigation down the side, usually a `Sidebar`. */
  sidebar?: () => unknown;
}>();
const attrs = useAttrs();

// Unknown until mounted, so the server and the first render are a rail.
const narrow = ref<boolean | undefined>(undefined);
let list: MediaQueryList | undefined;
const update = () => {
  narrow.value = list?.matches;
};
const listen = () => {
  list?.removeEventListener("change", update);
  list = undefined;
  narrow.value = undefined;
  if (props.layout !== "auto" || typeof window.matchMedia !== "function") return;
  list = window.matchMedia(appShellNarrowQuery(props.breakpoint));
  list.addEventListener("change", update);
  update();
};
onMounted(() => {
  listen();
  watch(() => [props.layout, props.breakpoint], listen);
});
onBeforeUnmount(() => list?.removeEventListener("change", update));

const resolved = computed(() => resolveAppShellLayout(props.layout, narrow.value));
const dataLayout = computed(() => appShellDataLayout(props.layout, narrow.value));
const uid = useId();
const main = computed(() => props.mainId ?? `app-shell-main-${uid}`);
const rootClass = computed(() =>
  clsx(appShellStyles({ scroll: props.scroll }), attrs.class as string),
);

const innerOpen = ref(props.defaultNavOpen);
const isOpen = computed(() => props.navOpen ?? innerOpen.value);
const setOpen = (next: boolean) => {
  if (props.navOpen === undefined) innerOpen.value = next;
  emit("update:navOpen", next);
  emit("navOpenChange", next);
};
// Shut whenever the layout is a rail, so it is never unmounted open.
const sheetOpen = computed(() => resolved.value === "sheet" && isOpen.value);
// Only a change from sheet to rail closes it: the first render of `auto` is a
// rail before it has measured.
watch(resolved, (now, was) => {
  if (was === "sheet" && now === "rail" && isOpen.value) setOpen(false);
});
let reported: string | undefined;
watch(
  dataLayout,
  (now) => {
    if (!now || now === reported) return;
    reported = now;
    emit("layoutChange", now);
  },
  { immediate: true },
);

provide(APP_SHELL_KEY, {
  get layout() {
    return resolved.value;
  },
  get hasSidebar() {
    return Boolean(slots.sidebar);
  },
});
</script>

<template>
  <Sheet :open="sheetOpen" @open-change="setOpen">
    <div :class="rootClass" :data-layout="dataLayout" v-bind="{ ...$attrs, class: undefined }">
      <a :class="APP_SHELL_CLASS.skip" :href="`#${main}`">{{ skipLinkLabel }}</a>
      <slot name="header" />
      <div :class="APP_SHELL_CLASS.body">
        <div v-if="resolved === 'rail' && slots.sidebar" :class="APP_SHELL_CLASS.sidebar">
          <slot name="sidebar" />
        </div>
        <main :id="main" :class="APP_SHELL_CLASS.main" tabindex="-1"><slot /></main>
      </div>
      <SheetContent
        v-if="resolved === 'sheet' && slots.sidebar"
        side="left"
        size="sm"
        :class="APP_SHELL_CLASS.sheet"
        :container="portalContainer"
      >
        <SheetTitle :class="APP_SHELL_CLASS.sheetTitle">{{ navTitle }}</SheetTitle>
        <SheetSidebarHost :on-navigate="() => setOpen(false)"
          ><slot name="sidebar"
        /></SheetSidebarHost>
      </SheetContent>
    </div>
  </Sheet>
</template>
