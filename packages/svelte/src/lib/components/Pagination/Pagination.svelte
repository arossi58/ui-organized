<!--
  Numbered page navigation with previous/next controls, and a jump menu behind
  each ellipsis.

  Ark UI has no Pagination primitive, so the markup is the facade's own — but the
  page window is not. Which numbers show and where the gaps fall is pure
  arithmetic in @ui-organized/core, shared with every other ui-organized library
  precisely so they cannot drift on the edge cases (a short range with no gaps, a
  gap exactly one page wide, the window pinned at either end).
-->
<script lang="ts">
  import { clsx } from "clsx";
  import { getPageItems, withEllipsisPages } from "@ui-organized/core";
  import Button from "../Button/Button.svelte";
  import Menu from "../Menu/Menu.svelte";
  import MenuContent from "../Menu/MenuContent.svelte";
  import MenuItem from "../Menu/MenuItem.svelte";
  import MenuTrigger from "../Menu/MenuTrigger.svelte";
  import type { PaginationProps } from "./Pagination.types.js";
  import "@ui-organized/core/components/Pagination/Pagination.css";

  let {
    page = $bindable(),
    count,
    onPageChange,
    siblingCount = 1,
    boundaryCount = 1,
    showPrevNext = true,
    class: className,
    ...rest
  }: PaginationProps = $props();

  /**
   * The window, flattened into one uniform shape before it reaches the markup.
   *
   * `PageItem` is `number | Ellipsis`, and narrowing that union inside an
   * `{#each}` costs a cast at every read. Deciding it here leaves the markup
   * reading a field.
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

  const entries = $derived<PageEntry[]>(
    withEllipsisPages(getPageItems(page, count, siblingCount, boundaryCount)).map((item, index) => {
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

  const goTo = (next: number) => {
    page = next;
    onPageChange?.(next);
  };
</script>

<nav aria-label="Pagination" class={clsx("pagination", className)} {...rest}>
  <ul class="pagination__list">
    {#if showPrevNext}
      <li>
        <Button
          intent="ghost"
          icon="chevron-left"
          disabled={page <= 1}
          aria-label="Previous page"
          onclick={() => goTo(page - 1)}
        />
      </li>
    {/if}
    {#each entries as entry (entry.key)}
      <li>
        {#if entry.page !== undefined}
          <button
            type="button"
            class="pagination__page text-default-body-medium"
            aria-current={entry.page === page ? "page" : undefined}
            aria-label={entry.label}
            onclick={() => goTo(entry.page!)}
          >
            {entry.page}
          </button>
        {:else}
          <!-- The gap is not decoration: it is the only way to reach the pages it hides. -->
          <Menu>
            <MenuTrigger>
              {#snippet asChild(props)}
                <button
                  {...props()}
                  type="button"
                  class="pagination__ellipsis"
                  aria-label={entry.label}
                >
                  <span aria-hidden="true">…</span>
                </button>
              {/snippet}
            </MenuTrigger>
            <MenuContent class="pagination__ellipsis-menu">
              {#each entry.pages as hidden (hidden)}
                <MenuItem value={String(hidden)} onSelect={() => goTo(hidden)}>
                  {hidden}
                </MenuItem>
              {/each}
            </MenuContent>
          </Menu>
        {/if}
      </li>
    {/each}
    {#if showPrevNext}
      <li>
        <Button
          intent="ghost"
          icon="chevron-right"
          disabled={page >= count}
          aria-label="Next page"
          onclick={() => goTo(page + 1)}
        />
      </li>
    {/if}
  </ul>
</nav>
