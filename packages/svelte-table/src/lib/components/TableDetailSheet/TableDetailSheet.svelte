<!--
  The row detail panel.

  Core owns prev/next navigation and the dirty guard; this owns the two things
  that are genuinely the adapter's: returning focus to the row the panel was
  opened from, and rendering the confirmation as a real `AlertDialog`.
-->
<script lang="ts">
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
  } from "@ui-organized/svelte";
  import { getTable } from "../../core/tableContext.js";

  let { size = "md", class: className }: { size?: "sm" | "md" | "lg"; class?: string } = $props();

  const table = getTable();
  const config = $derived(table.options.detail);
  const detail = table.detail;
  const open = $derived(detail.state.rowId !== null);
  const row = $derived(detail.row);
  const position = $derived(detail.state.index >= 0 ? detail.state.index + 1 : 0);
  const total = $derived(table.rows.length);

  /**
   * Focus came from a cell; the Sheet moves it into the panel and, on close,
   * hands it back to `document.body` unless we remember where it was.
   */
  let openedFrom = $state<HTMLElement | null>(null);
  $effect(() => {
    if (open && !openedFrom) {
      openedFrom = (document.activeElement as HTMLElement | null) ?? null;
      return;
    }
    if (!open && openedFrom) {
      const previous = openedFrom;
      openedFrom = null;
      // After the Sheet's own close transition has released the focus trap.
      requestAnimationFrame(() => previous.isConnected && previous.focus());
    }
  });

  const render = (value: unknown) => (typeof value === "function" ? undefined : value);
</script>

{#if config}
  <Sheet {open} onOpenChange={(next) => !next && detail.close()}>
    <SheetContent side="right" {size} class={clsx("data-table__detail", className)}>
      <!--
        The title clears the Sheet's own close control, which sits in the same
        top-right corner; the row pager gets its own line rather than competing
        with it for that space.
      -->
      <div class="data-table__detail-header">
        <SheetTitle>{row ? (config.title?.(row) ?? table.label) : table.label}</SheetTitle>
        {#if row && config.description}
          <SheetDescription>{config.description(row)}</SheetDescription>
        {/if}
      </div>

      <div class="data-table__detail-nav">
        <span class="data-table__detail-position">{position} of {total}</span>
        <Button
          intent="ghost"
          size="sm"
          icon="chevron-up"
          aria-label="Previous row"
          disabled={!detail.canStep(-1)}
          onclick={() => detail.step(-1)}
        />
        <Button
          intent="ghost"
          size="sm"
          icon="chevron-down"
          aria-label="Next row"
          disabled={!detail.canStep(1)}
          onclick={() => detail.step(1)}
        />
      </div>

      <div class="data-table__detail-body">
        {#if row}
          {@const body = config.render(row)}
          {#if typeof body === "function"}{@render body()}{:else}{render(body)}{/if}
        {/if}
      </div>

      {#if row && config.footer}
        <SheetFooter>
          {@const footer = config.footer(row)}
          {#if typeof footer === "function"}{@render footer()}{:else}{render(footer)}{/if}
        </SheetFooter>
      {/if}
    </SheetContent>
  </Sheet>

  <!-- The dirty guard. Core decided it was needed; this only asks. -->
  <AlertDialog
    open={detail.state.confirming !== null}
    onOpenChange={(next) => !next && detail.resolveConfirm(false)}
  >
    <AlertDialogContent>
      <AlertDialogTitle>Discard unsaved changes?</AlertDialogTitle>
      <AlertDialogDescription>
        This row has edits that have not been saved. Leaving now loses them.
      </AlertDialogDescription>
      <AlertDialogFooter>
        <AlertDialogCancel onclick={() => detail.resolveConfirm(false)}>
          Keep editing
        </AlertDialogCancel>
        <AlertDialogConfirm intent="destructive" onclick={() => detail.resolveConfirm(true)}>
          Discard
        </AlertDialogConfirm>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
{/if}
