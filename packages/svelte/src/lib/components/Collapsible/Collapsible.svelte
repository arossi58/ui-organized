<!-- Collapsible root — owns the open state of a single disclosure section. -->
<script lang="ts">
  import { Collapsible as ArkCollapsible } from "@ark-ui/svelte";
  import { clsx } from "clsx";
  import type { CollapsibleProps } from "./Collapsible.types.js";
  import "@ui-organized/core/components/Collapsible/Collapsible.css";

  let {
    open = $bindable(),
    defaultOpen,
    onOpenChange,
    disabled,
    class: className,
    children,
    ...rest
  }: CollapsibleProps = $props();
</script>

<!--
  `open` is bindable so `bind:open` works the way a Svelte consumer expects, and
  `onOpenChange` is kept alongside it so the API still matches the React package.
  Ark hands the callback a details object; it is unwrapped here so the facade's
  signature is `(open: boolean)` in both libraries.
-->
<ArkCollapsible.Root
  class={clsx("collapsible", className)}
  bind:open
  {defaultOpen}
  onOpenChange={(details) => {
    open = details.open;
    onOpenChange?.(details.open);
  }}
  {disabled}
  {...rest}
>
  {@render children?.()}
</ArkCollapsible.Root>
