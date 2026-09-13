<!--
  Appears only while something is selected.

  A `Toolbar` this time — it genuinely is a cluster of buttons, which is what
  `role="toolbar"` and its roving focus are for. Destructive actions route
  through `AlertDialog`; "archive 40,000 rows" is not an undo-able mis-click.
-->
<script setup lang="ts" generic="T extends RowData">
import { computed, ref } from "vue";
import { clsx } from "clsx";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogConfirm,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
  Button,
  Toolbar,
} from "@ui-organized/vue";
import type { CanonicalIconName } from "@ui-organized/utils";
import type { RowData } from "@ui-organized/table-core";
import { useTableContext } from "../../core/tableContext.js";
import type { BulkAction } from "../../core/types.js";

const props = defineProps<{ actions?: BulkAction<T>[]; class?: string }>();
const table = useTableContext<T>();

const confirming = ref<BulkAction<T> | null>(null);
const items = computed(() => props.actions ?? table.options.bulkActions ?? []);
const count = computed(() => table.selection.count.value);
const rowsWord = computed(() => (count.value === 1 ? "1 row" : `${count.value} rows`));

const run = (action: BulkAction<T>) => {
  void action.onRun(table.selection.rows.value, table.selection.asBulk());
};
const choose = (action: BulkAction<T>) => {
  if (action.destructive) confirming.value = action;
  else run(action);
};
const confirm = () => {
  if (confirming.value) run(confirming.value);
  confirming.value = null;
};
</script>

<template>
  <Toolbar
    v-if="count > 0"
    :class="clsx('data-table__selection-bar', $props.class)"
    aria-label="Bulk actions"
  >
    <span class="data-table__selection-count" aria-live="polite">
      {{ count === 1 ? "1 row selected" : `${count} rows selected` }}
    </span>

    <span v-if="table.selection.canSelectAllMatching.value" class="data-table__selection-all">
      <button
        type="button"
        class="data-table__selection-link"
        @click="table.selection.selectAllMatching()"
      >
        Select all {{ table.selection.totalMatching.value }} matching rows
      </button>
    </span>

    <Button
      v-for="action in items"
      :key="action.id"
      :size="table.size.value"
      :intent="action.destructive ? 'destructive-ghost' : 'ghost'"
      :icon="action.icon as CanonicalIconName | undefined"
      @click="choose(action)"
    >
      {{ action.label }}
    </Button>

    <Button :size="table.size.value" intent="ghost" @click="table.selection.clear()">
      Clear
    </Button>

    <AlertDialog
      :open="confirming !== null"
      @update:open="(open: boolean) => !open && (confirming = null)"
    >
      <AlertDialogContent>
        <AlertDialogTitle>
          {{ confirming?.confirm?.title ?? `${confirming?.label ?? "Continue"}?` }}
        </AlertDialogTitle>
        <AlertDialogDescription>
          {{
            confirming?.confirm?.description ??
            `This will ${confirming?.label.toLowerCase() ?? "act on"} ${rowsWord}. This cannot be undone.`
          }}
        </AlertDialogDescription>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogConfirm intent="destructive" @click="confirm">
            {{ confirming?.confirm?.confirmLabel ?? confirming?.label ?? "Confirm" }}
          </AlertDialogConfirm>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </Toolbar>
</template>
