<!--
  Lightweight tooltip. Wrap a trigger and pass `content`.

  Like the Svelte package and unlike React, the trigger is always an Ark Trigger
  element rather than sometimes being projected onto the child:
  `isValidElement(children)` has no Vue equivalent, because a slot is opaque —
  there is no way to ask whether it renders exactly one element. Consumers who
  need the tooltip's behaviour projected onto their own element compose Ark's
  Trigger directly.
-->
<script setup lang="ts">
import { computed } from "vue";
import { Tooltip as ArkTooltip } from "@ark-ui/vue";
import { definedOnly } from "../../props.js";
import { useTooltipDelays } from "./delays.js";
import { toPlacement } from "../Popover/positioning.js";
import type { TooltipProps } from "./Tooltip.types.js";
import "@ui-organized/core/components/Tooltip/Tooltip.css";

const props = withDefaults(defineProps<TooltipProps>(), {
  side: "top",
  align: "center",
  sideOffset: 6,
});
const emit = defineEmits<{ "update:open": [open: boolean]; openChange: [open: boolean] }>();

const shared = useTooltipDelays();
const contentIsString = computed(() => typeof props.content === "string");
const rootProps = computed(() =>
  definedOnly({
    open: props.open,
    defaultOpen: props.defaultOpen,
    openDelay: props.delay ?? shared?.value.delay,
    closeDelay: props.closeDelay ?? shared?.value.closeDelay,
  }),
);
</script>

<template>
  <slot v-if="disabled" />
  <ArkTooltip.Root
    v-else
    v-bind="rootProps"
    :positioning="{ placement: toPlacement(side, align), gutter: sideOffset }"
    @open-change="
      (details) => {
        emit('update:open', details.open);
        emit('openChange', details.open);
      }
    "
  >
    <ArkTooltip.Trigger class="tooltip__trigger"><slot /></ArkTooltip.Trigger>
    <Teleport :to="container ?? 'body'">
      <ArkTooltip.Positioner class="tooltip__positioner">
        <ArkTooltip.Content class="tooltip__popup text-default-body-small">
          <template v-if="contentIsString">{{ content }}</template>
          <component :is="content" v-else />
        </ArkTooltip.Content>
      </ArkTooltip.Positioner>
    </Teleport>
  </ArkTooltip.Root>
</template>
