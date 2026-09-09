<!--
  Pointer drag and keyboard, on one control.

  The drag is TanStack's own handler; the keyboard is core's `resizeKeyDown`, so
  the two cannot drift. It is a `role="separator"` with `aria-valuenow`, which is
  what makes the column width something a screen reader can report rather than
  something only a mouse can discover.
-->
<script lang="ts" generics="T extends RowData">
  import {
    getResizeHandleProps,
    resizeKeyDown,
    type RowData,
    type TableHeaderInstance,
  } from "@ui-organized/table-core";
  import { getTable } from "../../core/tableContext.js";
  import { svelteProps } from "../../core/props.js";

  let { header }: { header: TableHeaderInstance<T> } = $props();
  const table = getTable<T>();

  const column = $derived(header.column);
  const bounds = $derived.by(() => {
    const width = column.getSize();
    return {
      width,
      min: column.columnDef.minSize ?? 0,
      max: column.columnDef.maxSize ?? width,
    };
  });

  const handleProps = $derived.by(() => {
    const headerDef = column.columnDef.header;
    return getResizeHandleProps({
      columnId: column.id,
      columnLabel: typeof headerDef === "string" ? headerDef : column.id,
      width: bounds.width,
      min: bounds.min,
      max: bounds.max,
      active: column.getIsResizing(),
    });
  });

  /** Stops the header's sort button from firing on the same press. */
  function startResize(event: MouseEvent | TouchEvent) {
    event.stopPropagation();
    header.getResizeHandler()(event);
  }

  function onKeyDown(event: KeyboardEvent) {
    const action = resizeKeyDown(bounds, {
      key: event.key,
      shift: event.shiftKey,
      ctrl: event.ctrlKey,
      meta: event.metaKey,
    });
    if (action.type === "none") return;
    event.preventDefault();
    event.stopPropagation();
    if (action.type === "reset") {
      table.table.setColumnSizing((old: Record<string, number>) => {
        const next = { ...old };
        delete next[column.id];
        return next;
      });
      return;
    }
    table.table.setColumnSizing((old: Record<string, number>) => ({
      ...old,
      [column.id]: action.width,
    }));
  }
</script>

<button
  type="button"
  {...svelteProps(handleProps)}
  onmousedown={startResize}
  ontouchstart={startResize}
  onclick={(event) => event.stopPropagation()}
  onkeydown={onKeyDown}
></button>
