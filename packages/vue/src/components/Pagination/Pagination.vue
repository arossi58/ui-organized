<!--
  Numbered page navigation with previous/next controls, and a jump menu behind
  each ellipsis.

  Ark UI has no Pagination primitive, so the markup is the facade's own — but
  the page window is not. Which numbers show and where the gaps fall is pure
  arithmetic in @ui-organized/core, shared with every other ui-organized library
  precisely so the four cannot drift on the edge cases (a short range with no
  gaps, a gap exactly one page wide, the window pinned at either end).

  Where React takes an `onPageChange` callback, this emits — `v-model:page` for
  two-way binding, `@page-change` for the one-way notification — which is the
  shape every other stateful component in this package already has.
-->
<script setup lang="ts">
import { computed, useAttrs } from "vue";
import { clsx } from "clsx";
import { getPageItems, withEllipsisPages } from "@ui-organized/core";
import Button from "../Button/Button.vue";
import Menu from "../Menu/Menu.vue";
import MenuContent from "../Menu/MenuContent.vue";
import MenuItem from "../Menu/MenuItem.vue";
import MenuTrigger from "../Menu/MenuTrigger.vue";
import type { PaginationProps } from "./Pagination.types.js";
import "@ui-organized/core/components/Pagination/Pagination.css";

defineOptions({ inheritAttrs: false });
// `showPrevNext` defaults to `true`, and it has to say so: Vue casts an absent
// Boolean prop to `false`, so without the default a plain `<Pagination>` would
// silently lose both arrow controls. See ../../props.ts.
const props = withDefaults(defineProps<PaginationProps>(), {
  siblingCount: 1,
  boundaryCount: 1,
  showPrevNext: true,
});
const emit = defineEmits<{
  "update:page": [page: number];
  pageChange: [page: number];
}>();
const attrs = useAttrs();

/**
 * The window, flattened into one uniform shape before it reaches the template.
 *
 * `PageItem` is `number | Ellipsis`, and narrowing a union inside a template is
 * the kind of thing that type-checks in one vue-tsc release and not the next.
 * Deciding it here costs one map and leaves the template reading a field.
 */
interface PageEntry {
  key: string;
  /** The page this entry navigates to, or `undefined` for a collapsed gap. */
  page?: number;
  /** The pages a gap hides, offered as a jump menu. Empty for a real page. */
  pages: number[];
  /** Accessible name — a destination for a page, a range for a gap. */
  label: string;
}

const entries = computed<PageEntry[]>(() =>
  withEllipsisPages(
    getPageItems(props.page, props.count, props.siblingCount, props.boundaryCount),
  ).map((item, index) => {
    if (typeof item === "number") {
      return { key: `page-${item}`, page: item, pages: [], label: `Go to page ${item}` };
    }
    const first = item.pages[0];
    const last = item.pages[item.pages.length - 1];
    return {
      key: `ellipsis-${index}`,
      pages: item.pages,
      label: `Jump to a page between ${first} and ${last}`,
    };
  }),
);

const rootClass = computed(() => clsx("pagination", attrs.class as string));

const goTo = (page: number) => {
  emit("update:page", page);
  emit("pageChange", page);
};
</script>

<template>
  <nav aria-label="Pagination" :class="rootClass" v-bind="{ ...$attrs, class: undefined }">
    <ul class="pagination__list">
      <li v-if="showPrevNext">
        <Button
          intent="ghost"
          icon="chevron-left"
          :disabled="page <= 1"
          aria-label="Previous page"
          @click="goTo(page - 1)"
        />
      </li>
      <li v-for="entry in entries" :key="entry.key">
        <button
          v-if="entry.page !== undefined"
          type="button"
          class="pagination__page text-default-body-medium"
          :aria-current="entry.page === page ? 'page' : undefined"
          :aria-label="entry.label"
          @click="goTo(entry.page)"
        >
          {{ entry.page }}
        </button>
        <!-- The gap is not decoration: it is the only way to reach the pages it hides. -->
        <Menu v-else>
          <MenuTrigger as-child>
            <button type="button" class="pagination__ellipsis" :aria-label="entry.label">
              <span aria-hidden="true">…</span>
            </button>
          </MenuTrigger>
          <MenuContent class="pagination__ellipsis-menu">
            <MenuItem
              v-for="hidden in entry.pages"
              :key="hidden"
              :value="String(hidden)"
              @select="goTo(hidden)"
            >
              {{ hidden }}
            </MenuItem>
          </MenuContent>
        </Menu>
      </li>
      <li v-if="showPrevNext">
        <Button
          intent="ghost"
          icon="chevron-right"
          :disabled="page >= count"
          aria-label="Next page"
          @click="goTo(page + 1)"
        />
      </li>
    </ul>
  </nav>
</template>
