<!--
  The developer's own header buttons — "New user", "Import", "Refresh".

  Rendered as real buttons rather than folded into a menu, because these are the
  actions a page is *for*: a primary action hidden behind an overflow menu is a
  primary action nobody finds. Each carries whatever intent the developer gave
  it, so exactly one of them can be the page's call to action and the rest can
  recede.
-->
<script lang="ts">
  import { clsx } from "clsx";
  import { Button } from "@ui-organized/svelte";
  import type { CanonicalIconName } from "@ui-organized/utils";
  import { getTable } from "../../core/tableContext.js";
  import type { TableAction } from "../../core/types.js";

  let { actions, class: className }: { actions?: TableAction[]; class?: string } = $props();
  const table = getTable();
  const items = $derived(actions ?? table.options.actions ?? []);

  const iconOf = (action: TableAction) => action.icon as CanonicalIconName | undefined;
  // An icon-only button drops its visible label but keeps its accessible one —
  // the label is the whole name either way.
  const isIconOnly = (action: TableAction) => action.iconOnly === true && action.icon !== undefined;
</script>

{#if items.length > 0}
  <div class={clsx("data-table__toolbar-actions", className)}>
    {#each items as action (action.id)}
      <Button
        intent={action.intent ?? "tertiary"}
        size={table.size}
        icon={iconOf(action)}
        disabled={action.disabled}
        aria-label={isIconOnly(action) ? action.label : undefined}
        onclick={() => void action.onRun()}
      >
        {#if !isIconOnly(action)}{action.label}{/if}
      </Button>
    {/each}
  </div>
{/if}
