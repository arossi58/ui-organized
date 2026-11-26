<!--
  A search box over a list of commands, in a dialog near the top of the
  screen. Typing narrows the list and highlights its first command; the arrows
  move through it, wrapping at the ends; Enter or a click runs one. Built from
  Dialog and Ark's Listbox, as React's CommandMenu is, with the same markup.
-->
<script lang="ts">
  import { Listbox as ArkListbox, createListCollection } from "@ark-ui/svelte";
  import {
    createContains,
    detectPlatform,
    filterCommandItems,
    firstCommand,
    groupCommandItems,
    matchesHotkey,
    orderCommandItems,
  } from "@ui-organized/core";
  import Dialog from "../Dialog/Dialog.svelte";
  import DialogContent from "../Dialog/DialogContent.svelte";
  import Icon from "../Icon/Icon.svelte";
  import Kbd from "../Kbd/Kbd.svelte";
  import type { CommandMenuItem, CommandMenuProps } from "./CommandMenu.types.js";
  import "@ui-organized/core/components/CommandMenu/CommandMenu.css";
  import { glyph } from "../../icons/glyph.js";

  let {
    items,
    open = $bindable(),
    defaultOpen,
    onOpenChange,
    onSelect,
    closeOnSelect = true,
    placeholder = "Type a command or search…",
    emptyMessage = "No results found.",
    label = "Command menu",
    hotkey,
    platform,
    portalContainer,
  }: CommandMenuProps = $props();

  /** Built once: the collator is the expensive part of a comparison. */
  const contains = createContains();

  // svelte-ignore state_referenced_locally
  let ownOpen = $state(defaultOpen ?? false);
  const isOpen = $derived(open ?? ownOpen);
  function setOpen(next: boolean) {
    if (open === undefined) ownOpen = next;
    else open = next;
    onOpenChange?.(next);
  }

  let query = $state("");
  let inputEl = $state<HTMLInputElement | null>(null);
  // A menu reopened starts from the whole list, not the last search.
  $effect(() => {
    if (!isOpen) query = "";
  });

  const matches = $derived(orderCommandItems(filterCommandItems(items, query, contains)));
  const groups = $derived(groupCommandItems(matches));

  /**
   * Derived rather than set in an effect, so it is valid for the list being
   * drawn: see React's CommandMenu. A row the pointer or the arrows moved to
   * is kept until the query changes.
   */
  let moved = $state<{ query: string; value: string } | null>(null);
  const highlighted = $derived(
    moved && moved.query === query && matches.some((item) => item.value === moved!.value)
      ? moved.value
      : firstCommand(matches),
  );

  const collection = $derived(
    createListCollection<CommandMenuItem>({
      items: matches,
      itemToValue: (item) => item.value,
      itemToString: (item) => item.label,
      isItemDisabled: (item) => !!item.disabled,
    }),
  );

  $effect(() => {
    if (!hotkey) return;
    const shortcut = hotkey;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.repeat) return;
      if (!matchesHotkey(event, shortcut, detectPlatform())) return;
      event.preventDefault();
      setOpen(!isOpen);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  });
</script>

{#snippet rows(bucket: CommandMenuItem[])}
  {#each bucket as item (item.value)}
    <!-- data-highlighted is the menu's own: see React's CommandMenu. -->
    <ArkListbox.Item {item} highlightOnHover class="command-menu__item" data-highlighted={item.value === highlighted ? "" : undefined}>
      {#if item.icon != null}
        <span class="command-menu__item-icon" aria-hidden="true"><Icon name={item.icon} size={16} /></span>
      {/if}
      <!-- Pinned to a div: Ark Svelte 5.24's part is a span, React's a div. See Listbox. -->
      <ArkListbox.ItemText>
        {#snippet asChild(project)}
          <div {...project()} class="command-menu__item-text" data-highlighted={item.value === highlighted ? "" : undefined}>{item.label}</div>
        {/snippet}
      </ArkListbox.ItemText>
      {#if item.shortcut}<Kbd keys={item.shortcut} size="sm" {platform} />{/if}
    </ArkListbox.Item>
  {/each}
{/snippet}

<Dialog open={isOpen} onOpenChange={setOpen}>
  <DialogContent showClose={false} container={portalContainer} class="command-menu" aria-label={label}>
    <ArkListbox.Root
      class="command-menu__listbox"
      {collection}
      value={[]}
      highlightedValue={highlighted}
      onHighlightChange={(details) => {
        // zag clears the highlight when the pointer leaves a row; the menu keeps it.
        if (details.highlightedValue != null) moved = { query, value: details.highlightedValue };
      }}
      onSelect={(details) => {
        onSelect?.(details.value);
        if (closeOnSelect) setOpen(false);
      }}
      loopFocus
      typeahead={false}
    >
      <ArkListbox.Label class="command-menu__label">{label}</ArkListbox.Label>
      <div class="command-menu__search">
        <Icon name={glyph("search")} size={20} />
        <ArkListbox.Input
          bind:ref={inputEl}
          class="command-menu__input"
          role="combobox"
          aria-expanded="true"
          aria-label={label}
          {placeholder}
          value={query}
          oninput={(event) => (query = event.currentTarget.value)}
        />
      </div>
      <!-- zag focuses the list on a row's mousedown; focus goes back to the search box. -->
      <ArkListbox.Content class="command-menu__list" tabindex={-1} onfocus={() => inputEl?.focus({ preventScroll: true })}>
        {#each groups as [group, bucket] (group)}
          {#if group == null}
            {@render rows(bucket)}
          {:else}
            <ArkListbox.ItemGroup class="command-menu__group">
              <ArkListbox.ItemGroupLabel class="command-menu__group-label">{group}</ArkListbox.ItemGroupLabel>
              {@render rows(bucket)}
            </ArkListbox.ItemGroup>
          {/if}
        {/each}
        {#if matches.length === 0}
          <div role="option" aria-disabled="true" aria-selected="false" class="command-menu__empty">{emptyMessage}</div>
        {/if}
      </ArkListbox.Content>
    </ArkListbox.Root>
  </DialogContent>
</Dialog>
