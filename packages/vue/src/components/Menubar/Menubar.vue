<!--
  Horizontal container for a row of menus. Place the existing `Menu` components
  inside it — one `<Menu>` per top-level entry — styling each `MenuTrigger` with
  the `menubar__trigger` class:

  ```vue
  <Menubar>
    <Menu>
      <MenuTrigger class="menubar__trigger">File</MenuTrigger>
      <MenuContent>…</MenuContent>
    </Menu>
  </Menubar>
  ```

  Ark UI has no Menubar primitive and the menus inside are independent Ark
  machines, so the bar supplies the part a menubar owns and a lone menu can't:
  its triggers are menuitems (see ./menubarContext.ts) and arrow keys move
  between them as one tab stop. Opening and navigating within a menu is still
  each menu's own business.
-->
<script setup lang="ts">
import { computed, onMounted, onUpdated, ref, useAttrs } from "vue";
import { clsx } from "clsx";
import { provideMenubar } from "./menubarContext.js";
import type { MenubarProps } from "./Menubar.types.js";
import "@ui-organized/core/components/Menubar/Menubar.css";

defineOptions({ inheritAttrs: false });
const props = withDefaults(defineProps<MenubarProps>(), { orientation: "horizontal" });
const attrs = useAttrs();
const rootClass = computed(() => clsx("menubar", attrs.class as string));

provideMenubar();

const root = ref<HTMLDivElement | null>(null);

// `data-menubar-item`, not `[role="menuitem"]` — a menu whose content is
// teleported *into* the bar (a docs preview that contains its own overlays)
// would otherwise put that menu's own items in range. MenuTrigger sets it.
const triggers = (): HTMLElement[] =>
  Array.from(root.value?.querySelectorAll<HTMLElement>("[data-menubar-item]") ?? []);

/**
 * Roving tabindex — a menubar is a single tab stop, and arrows move within it.
 *
 * Applied to the DOM rather than passed down, because the triggers belong to
 * separate Ark machines and the bar has no handle on their props. Nothing runs
 * during SSR, which is deliberate: React's equivalent is an effect, so neither
 * library emits a `tabindex` on the server and the two agree there too.
 */
const rove = (focused?: HTMLElement) => {
  const items = triggers();
  const active = focused ?? items.find((item) => item.tabIndex === 0) ?? items[0];
  for (const item of items) item.tabIndex = item === active ? 0 : -1;
};

onMounted(() => rove());
// Re-run when the set of triggers changes, the way React's effect re-runs on
// `children`: a menu added to the bar arrives with the browser default
// tabindex and would become a second tab stop.
onUpdated(() => rove());

const onKeydown = (event: KeyboardEvent) => {
  // A caller's own handler ran first (see the attribute order in the template)
  // and may have handled the key itself.
  if (event.defaultPrevented) return;

  const [back, forward] =
    props.orientation === "vertical" ? ["ArrowUp", "ArrowDown"] : ["ArrowLeft", "ArrowRight"];
  const items = triggers();
  const from = items.indexOf(document.activeElement as HTMLElement);
  if (from === -1 || items.length === 0) return;

  let to: number;
  if (event.key === forward) to = (from + 1) % items.length;
  else if (event.key === back) to = (from - 1 + items.length) % items.length;
  else if (event.key === "Home") to = 0;
  else if (event.key === "End") to = items.length - 1;
  else return;

  event.preventDefault();
  const next = items[to];
  if (!next) return;
  rove(next);
  next.focus();
};

// `focusin`, not `focus`: React's `onFocus` is its own synthetic event and does
// bubble, so the DOM equivalent of the handler being ported is the bubbling one.
// `focus` fires only on the element itself and would never see a trigger.
const onFocusin = (event: FocusEvent) => {
  const item = (event.target as HTMLElement | null)?.closest<HTMLElement>("[data-menubar-item]");
  if (item) rove(item);
};
</script>

<template>
  <!--
    `v-bind="$attrs"` comes before the handlers so a caller's listener is merged
    ahead of ours and runs first — the order React has, and the order the
    `defaultPrevented` check above depends on.
  -->
  <div
    ref="root"
    role="menubar"
    :aria-orientation="orientation"
    :data-orientation="orientation"
    :class="rootClass"
    v-bind="{ ...$attrs, class: undefined }"
    @keydown="onKeydown"
    @focusin="onFocusin"
  >
    <slot />
  </div>
</template>
