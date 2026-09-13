<!--
  The developer's own header buttons — "New user", "Import", "Refresh".

  Rendered as real buttons rather than folded into a menu, because these are the
  actions a page is *for*: a primary action hidden behind an overflow menu is a
  primary action nobody finds. Each carries whatever intent the developer gave
  it, so exactly one of them can be the page's call to action and the rest can
  recede.
-->
<script setup lang="ts">
import { computed } from "vue";
import { clsx } from "clsx";
import { Button } from "@ui-organized/vue";
import type { CanonicalIconName } from "@ui-organized/utils";
import { useTableContext } from "../../core/tableContext.js";
import type { TableAction } from "../../core/types.js";

const props = defineProps<{ actions?: TableAction[]; class?: string }>();
const table = useTableContext();
const items = computed(() => props.actions ?? table.options.actions ?? []);

const iconOf = (action: TableAction) => action.icon as CanonicalIconName | undefined;
// An icon-only button drops its visible label but keeps its accessible one —
// the label is the whole name either way.
const isIconOnly = (action: TableAction) => action.iconOnly === true && action.icon !== undefined;
</script>

<template>
  <div v-if="items.length > 0" :class="clsx('data-table__toolbar-actions', $props.class)">
    <Button
      v-for="action in items"
      :key="action.id"
      :intent="action.intent ?? 'tertiary'"
      :size="table.size.value"
      :icon="iconOf(action)"
      :disabled="action.disabled"
      :aria-label="isIconOnly(action) ? action.label : undefined"
      @click="action.onRun()"
    >
      <template v-if="!isIconOnly(action)">{{ action.label }}</template>
    </Button>
  </div>
</template>
