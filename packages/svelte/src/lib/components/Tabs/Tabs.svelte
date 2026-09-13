<script lang="ts">
  import { Tabs as ArkTabs } from "@ark-ui/svelte";
  import { clsx } from "clsx";
  import { tabsStyles } from "@ui-organized/core";
  import type { TabsProps } from "./Tabs.types.js";
  import "@ui-organized/core/components/Tabs/Tabs.css";

  let {
    tabs,
    value = $bindable(),
    defaultValue,
    onValueChange,
    orientation = "horizontal",
    size = "default",
    class: className,
  }: TabsProps = $props();

  // Zag tabs are keyed by string; coerce at the boundary so numeric tab values
  // keep working.
  const resolvedDefault = $derived(
    defaultValue != null
      ? String(defaultValue)
      : tabs[0] != null
        ? String(tabs[0].value)
        : undefined,
  );
</script>

<ArkTabs.Root
  value={value != null ? String(value) : undefined}
  defaultValue={resolvedDefault}
  onValueChange={(details) => {
    value = details.value;
    onValueChange?.(details.value);
  }}
  {orientation}
  class={clsx(tabsStyles({ orientation, size }), className)}
>
  <ArkTabs.List class="tabs__list">
    {#each tabs as tab (tab.value)}
      <ArkTabs.Trigger
        value={String(tab.value)}
        disabled={tab.disabled}
        class="tabs__tab text-emphasis-body-large"
      >
        {#if typeof tab.label === "string"}{tab.label}{:else}{@render tab.label()}{/if}
      </ArkTabs.Trigger>
    {/each}
  </ArkTabs.List>
  <div class="tabs__panels">
    {#each tabs as tab (tab.value)}
      <ArkTabs.Content value={String(tab.value)} class="tabs__panel">
        {#if typeof tab.content === "string"}{tab.content}{:else}{@render tab.content()}{/if}
      </ArkTabs.Content>
    {/each}
  </div>
</ArkTabs.Root>
