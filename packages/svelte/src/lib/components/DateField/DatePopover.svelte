<!--
  The portal + positioner + popup surface shared by the date pickers. Must be
  rendered inside a controlled `ArkPopover.Root` (which owns the anchor
  positioning and the initial focus); the trigger lives in the field.
-->
<script lang="ts">
  import { Popover as ArkPopover, Portal } from "@ark-ui/svelte";
  import type { DatePopoverProps } from "./DatePopover.types.js";
  import "@ui-organized/core/components/DateField/DatePopover.css";

  let { container, label, children }: DatePopoverProps = $props();
</script>

<Portal container={container ?? undefined}>
  <!--
    The positioner class must stay a plain string literal: the overlay-stacking
    test scans for it, and stacking is declared on the popup rather than here
    because zag writes an inline z-index onto the positioner and reads it from
    the popup's rule.
  -->
  <ArkPopover.Positioner class="date-popover-positioner">
    <ArkPopover.Content class="date-popover" aria-label={label}>
      {@render children?.()}
    </ArkPopover.Content>
  </ArkPopover.Positioner>
</Portal>
