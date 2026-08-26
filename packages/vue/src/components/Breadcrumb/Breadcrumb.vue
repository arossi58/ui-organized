<!--
  A trail of links showing the current page's location in a hierarchy.

  No Ark machine behind it — Ark UI has no Breadcrumb primitive — so the markup
  here is the contract, compared element for element against the React library
  by the parity gate.

  The separator is a slot rather than a prop, which is the one shape difference
  from React's `separator` node: a slot is how Vue passes markup, and a prop
  typed `string | Component` could not carry, say, a styled span without the
  caller defining a component for it.
-->
<script setup lang="ts">
import { computed, useAttrs } from "vue";
import { clsx } from "clsx";
import Icon from "../Icon/Icon.vue";
import type { BreadcrumbProps } from "./Breadcrumb.types.js";
import "@ui-organized/core/components/Breadcrumb/Breadcrumb.css";

const ICON_SIZE = 16;

defineOptions({ inheritAttrs: false });
const props = defineProps<BreadcrumbProps>();
const attrs = useAttrs();
const rootClass = computed(() =>
  clsx("breadcrumb", "text-default-body-medium", attrs.class as string),
);

const isLast = (index: number) => index === props.items.length - 1;
const isString = (value: unknown) => typeof value === "string";
</script>

<template>
  <nav aria-label="Breadcrumb" :class="rootClass" v-bind="{ ...$attrs, class: undefined }">
    <ol class="breadcrumb__list">
      <li v-for="(item, index) in items" :key="index" class="breadcrumb__item">
        <a v-if="item.href && !isLast(index)" :href="item.href" class="breadcrumb__link">
          <Icon v-if="item.icon" :name="item.icon" :size="ICON_SIZE" class="breadcrumb__icon" />
          <template v-if="isString(item.label)">{{ item.label }}</template>
          <component :is="item.label" v-else />
        </a>
        <!--
          The last crumb is the current page even when it carries an href, so it
          renders as text rather than as a link nobody would follow.
        -->
        <span v-else class="breadcrumb__current" :aria-current="isLast(index) ? 'page' : undefined">
          <Icon v-if="item.icon" :name="item.icon" :size="ICON_SIZE" class="breadcrumb__icon" />
          <template v-if="isString(item.label)">{{ item.label }}</template>
          <component :is="item.label" v-else />
        </span>
        <span v-if="!isLast(index)" class="breadcrumb__separator" aria-hidden="true">
          <slot name="separator"><Icon name="chevron-right" :size="ICON_SIZE" /></slot>
        </span>
      </li>
    </ol>
  </nav>
</template>
