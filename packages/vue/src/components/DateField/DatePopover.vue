<!--
  The teleport + positioner + popup surface shared by the date pickers. Must be
  rendered inside a controlled `ArkPopover.Root` (which owns the anchor
  positioning and the initial focus); the trigger lives in the field.

  Vue has no Ark Portal component — Teleport is built into the framework, and
  Ark Vue relies on it rather than shipping its own.
-->
<script setup lang="ts">
import { Popover as ArkPopover } from "@ark-ui/vue";
import type { DatePopoverProps } from "./DatePopover.types.js";
import "@ui-organized/core/components/DateField/DatePopover.css";

defineProps<DatePopoverProps>();
</script>

<template>
  <Teleport :to="container ?? 'body'">
    <!--
      The positioner class must stay a plain string literal: the overlay-stacking
      test scans for it, and stacking is declared on the popup rather than here
      because zag writes an inline z-index onto the positioner and reads it from
      the popup's rule.
    -->
    <ArkPopover.Positioner class="date-popover-positioner">
      <ArkPopover.Content class="date-popover" :aria-label="label">
        <slot />
      </ArkPopover.Content>
    </ArkPopover.Positioner>
  </Teleport>
</template>
