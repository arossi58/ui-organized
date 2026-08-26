<!--
  `DEFAULT_PARTS` lives in a plain `<script>` rather than beside the rest of the
  setup code: a `withDefaults` factory cannot reference a `<script setup>`
  binding, because the compiler hoists the props definition out of `setup()` to
  where that binding does not exist yet. A normal script block is module scope,
  which is early enough.
-->
<script lang="ts">
import type { TimerPart } from "./Timer.types.js";

const DEFAULT_PARTS: TimerPart[] = ["hours", "minutes", "seconds"];
</script>

<script setup lang="ts">
import { computed, useAttrs } from "vue";
import { Timer as ArkTimer } from "@ark-ui/vue";
import { clsx } from "clsx";
import { timerStyles } from "@ui-organized/core";
import { definedOnly } from "../../props.js";
import Button from "../Button/Button.vue";
import type { TimerProps } from "./Timer.types.js";
import "@ui-organized/core/components/Timer/Timer.css";

defineOptions({ inheritAttrs: false });
// Every boolean forwarded to Ark below must default to `undefined`. Vue casts an
// absent Boolean prop to `false`, and `definedOnly` then forwards that as a
// deliberate choice — see ../../props.ts. `showControls` and `showLabels` are
// not forwarded, so their `false` is ours to state.
const props = withDefaults(defineProps<TimerProps>(), {
  parts: () => DEFAULT_PARTS,
  size: "md",
  showControls: false,
  showLabels: false,
  countdown: undefined,
  autoStart: undefined,
});
const emit = defineEmits<{ complete: [] }>();

const attrs = useAttrs();
const rootClass = computed(() =>
  clsx(timerStyles({ size: props.size, variant: props.variant }), attrs.class as string),
);

const rootProps = computed(() =>
  definedOnly({
    countdown: props.countdown,
    startMs: props.startMs,
    targetMs: props.targetMs,
    autoStart: props.autoStart,
    interval: props.interval,
  }),
);
</script>

<template>
  <ArkTimer.Root :class="rootClass" v-bind="rootProps" @complete="emit('complete')">
    <ArkTimer.Area class="timer__area">
      <template v-for="(part, index) in parts" :key="part">
        <ArkTimer.Separator v-if="index > 0" class="timer__separator" aria-hidden="true">
          :
        </ArkTimer.Separator>
        <div class="timer__segment">
          <ArkTimer.Item :type="part" class="timer__value" />
          <span v-if="showLabels" class="timer__label">{{ part }}</span>
        </div>
      </template>
    </ArkTimer.Area>

    <ArkTimer.Control v-if="showControls" class="timer__control">
      <!--
        zag hides whichever trigger does not apply to the current state, so start
        and resume can both be present without a conditional here.

        Each is the library Button projected through Ark's `as-child`, so they
        inherit every interactive token instead of restating them.
      -->
      <ArkTimer.ActionTrigger action="start" as-child>
        <Button intent="primary" :size="size" icon="play" type="button">Start</Button>
      </ArkTimer.ActionTrigger>
      <ArkTimer.ActionTrigger action="pause" as-child>
        <Button intent="secondary" :size="size" icon="pause" type="button">Pause</Button>
      </ArkTimer.ActionTrigger>
      <ArkTimer.ActionTrigger action="resume" as-child>
        <Button intent="secondary" :size="size" icon="play" type="button">Resume</Button>
      </ArkTimer.ActionTrigger>
      <ArkTimer.ActionTrigger action="reset" as-child>
        <Button intent="ghost" :size="size" icon="refresh" type="button">Reset</Button>
      </ArkTimer.ActionTrigger>
    </ArkTimer.Control>
  </ArkTimer.Root>
</template>
