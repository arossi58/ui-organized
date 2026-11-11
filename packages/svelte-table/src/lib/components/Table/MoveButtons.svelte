<!--
  Left and right, for a column that can be moved — the click-and-keyboard half
  of dragging the header. Over the header's end rather than in its flow, so
  showing them does not shove the label. In `"always"` mode the stylesheet
  shows them on hover and focus; in `"toggle"` mode they are up for as long as
  reorder mode is.

  In an interactive grid they are not tab stops, like every control inside a
  cell; Alt+Arrow on the focused header is the keyboard route there.
-->
<script lang="ts">
  import { Icon } from "@ui-organized/svelte";
  import { internalGlyph as glyph } from "@ui-organized/svelte";
  import { getTable } from "../../core/tableContext.js";

  let { columnId, name }: { columnId: string; name: string } = $props();
  const table = getTable();

  let left = $state<HTMLButtonElement | null>(null);
  let right = $state<HTMLButtonElement | null>(null);

  const press = (direction: -1 | 1, event: MouseEvent) => {
    const hadFocus = document.activeElement === event.currentTarget;
    table.reorder.move(columnId, direction);
    if (!hadFocus) return;
    // Re-rendering in the new order moves this header's DOM node, and a moved
    // node drops focus. Put it back on the same button — or on the other one,
    // when this move took the column to the end it pointed at.
    requestAnimationFrame(() => {
      const own = direction === -1 ? left : right;
      const other = direction === -1 ? right : left;
      (own && !own.disabled ? own : other)?.focus();
    });
  };
</script>

<span class="data-table__move" data-mode={table.reorder.mode}>
  <button
    bind:this={left}
    type="button"
    class="data-table__move-button"
    aria-label={`Move ${name} left`}
    disabled={!table.reorder.canMove(columnId, -1)}
    tabindex={table.interactive ? -1 : undefined}
    onclick={(event) => press(-1, event)}
  >
    <Icon name={glyph("chevron-left")} size={16} />
  </button>
  <button
    bind:this={right}
    type="button"
    class="data-table__move-button"
    aria-label={`Move ${name} right`}
    disabled={!table.reorder.canMove(columnId, 1)}
    tabindex={table.interactive ? -1 : undefined}
    onclick={(event) => press(1, event)}
  >
    <Icon name={glyph("chevron-right")} size={16} />
  </button>
</span>
