<!--
  The row detail panel.

  Core owns prev/next navigation and the dirty guard; this owns the two things
  that are genuinely the adapter's: returning focus to the row the panel was
  opened from, and rendering the confirmation as a real `AlertDialog`.
-->
<script setup lang="ts">
import { computed, ref, watch } from "vue";
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetTitle,
} from "@ui-organized/vue";
import { useTableContext } from "../../core/tableContext.js";

withDefaults(defineProps<{ size?: "sm" | "md" | "lg"; class?: string }>(), { size: "md" });

const table = useTableContext();
const config = computed(() => table.options.detail);
const detail = table.detail;
const open = computed(() => detail.state.value.rowId !== null);
const row = computed(() => detail.row.value);
const position = computed(() => (detail.state.value.index >= 0 ? detail.state.value.index + 1 : 0));
const total = computed(() => table.rows.value.length);

/**
 * Focus came from a cell; the Sheet moves it into the panel and, on close, hands
 * it back to `document.body` unless we remember where it was.
 */
const openedFrom = ref<HTMLElement | null>(null);
watch(open, (isOpen) => {
  if (isOpen && !openedFrom.value) {
    openedFrom.value = (document.activeElement as HTMLElement | null) ?? null;
    return;
  }
  if (!isOpen && openedFrom.value) {
    const previous = openedFrom.value;
    openedFrom.value = null;
    // After the Sheet's own close transition has released the focus trap.
    requestAnimationFrame(() => previous.isConnected && previous.focus());
  }
});
</script>

<template>
  <template v-if="config">
    <Sheet :open="open" @update:open="(next: boolean) => !next && detail.close()">
      <SheetContent side="right" :size="size" :class="clsx('data-table__detail', $props.class)">
        <!--
          The title clears the Sheet's own close control, which sits in the same
          top-right corner; the row pager gets its own line rather than competing
          with it for that space.
        -->
        <div class="data-table__detail-header">
          <SheetTitle>{{
            row ? (config.title?.(row) ?? table.label.value) : table.label.value
          }}</SheetTitle>
          <SheetDescription v-if="row && config.description">
            {{ config.description(row) }}
          </SheetDescription>
        </div>

        <div class="data-table__detail-nav">
          <span class="data-table__detail-position">{{ position }} of {{ total }}</span>
          <Button
            intent="ghost"
            size="sm"
            icon="chevron-up"
            aria-label="Previous row"
            :disabled="!detail.canStep(-1)"
            @click="detail.step(-1)"
          />
          <Button
            intent="ghost"
            size="sm"
            icon="chevron-down"
            aria-label="Next row"
            :disabled="!detail.canStep(1)"
            @click="detail.step(1)"
          />
        </div>

        <div class="data-table__detail-body">
          <component :is="() => (row ? config!.render(row) : null)" />
        </div>

        <SheetFooter v-if="row && config.footer">
          <component :is="() => config!.footer!(row!)" />
        </SheetFooter>
      </SheetContent>
    </Sheet>

    <!-- The dirty guard. Core decided it was needed; this only asks. -->
    <AlertDialog
      :open="detail.state.value.confirming !== null"
      @update:open="(next: boolean) => !next && detail.resolveConfirm(false)"
    >
      <AlertDialogContent>
        <AlertDialogTitle>Discard unsaved changes?</AlertDialogTitle>
        <AlertDialogDescription>
          This row has edits that have not been saved. Leaving now loses them.
        </AlertDialogDescription>
        <AlertDialogFooter>
          <AlertDialogCancel @click="detail.resolveConfirm(false)">Keep editing</AlertDialogCancel>
          <AlertDialogConfirm intent="destructive" @click="detail.resolveConfirm(true)">
            Discard
          </AlertDialogConfirm>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </template>
</template>
