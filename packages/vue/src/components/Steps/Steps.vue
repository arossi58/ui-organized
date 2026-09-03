<script setup lang="ts">
import { computed, useAttrs } from "vue";
import { Steps as ArkSteps } from "@ark-ui/vue";
import { clsx } from "clsx";
import { stepsStyles, OMIT_ARIA } from "@ui-organized/core";
import { definedOnly } from "../../props.js";
import Button from "../Button/Button.vue";
import Icon from "../Icon/Icon.vue";
import type { StepsProps } from "./Steps.types.js";
import "@ui-organized/core/components/Steps/Steps.css";

/** The completed tick sits inside the indicator circle at every size — it marks
 *  the step rather than scaling with the surrounding text. */
const COMPLETE_ICON_SIZE = 16;

defineOptions({ inheritAttrs: false });
// Every boolean forwarded to Ark below must default to `undefined`. Vue casts an
// absent Boolean prop to `false`, and `definedOnly` then forwards that as a
// deliberate choice — see ../../props.ts. `showContent` is not forwarded but
// defaults to true, which the cast would also get wrong.
const props = withDefaults(defineProps<StepsProps>(), {
  orientation: "horizontal",
  size: "md",
  variant: "numbered",
  showContent: true,
  linear: undefined,
});
const emit = defineEmits<{
  "update:step": [step: number];
  stepChange: [step: number];
  stepComplete: [];
}>();

const attrs = useAttrs();
const rootClass = computed(() =>
  clsx(
    stepsStyles({
      orientation: props.orientation,
      size: props.size,
      variant: props.variant,
    }),
    attrs.class as string,
  ),
);

const rootProps = computed(() =>
  definedOnly({
    step: props.step,
    defaultStep: props.defaultStep,
    linear: props.linear,
  }),
);

// Written here rather than inline: a Vue template expression cannot carry an
// object type annotation, and the handler's details argument needs one.
function onStepChange(details: { step: number }) {
  emit("update:step", details.step);
  emit("stepChange", details.step);
}
const isString = (v: unknown) => typeof v === "string";
</script>

<!--
  `count` is derived, never a prop: a count out of step with `steps` would desync
  the progress bar and the trigger list against each other.
-->
<template>
  <ArkSteps.Root
    :class="rootClass"
    :count="steps.length"
    v-bind="rootProps"
    :orientation="orientation"
    @step-change="onStepChange"
    @step-complete="emit('stepComplete')"
  >
    <ArkSteps.List class="steps__list">
      <!--
        A `tablist` may own only tabs, and each Item is a direct child div that
        is neither. Ark already marks it `role="presentation"`, but presentation
        is *ignored* on an element carrying a global ARIA attribute — and Ark
        also sets `aria-current` here. Dropping `aria-current` lets the
        presentation role hold; nothing is lost, because the trigger inside
        already reports `aria-selected`. Same fix as the React library.
      -->
      <ArkSteps.Item
        v-for="(item, index) in steps"
        :key="item.title"
        :index="index"
        class="steps__item"
        role="presentation"
        :aria-current="OMIT_ARIA"
      >
        <!--
          Ark names a panel on every trigger, but the panels only exist when
          `showContent` is on. Left in place the reference dangles, which is an
          ARIA error and costs the trigger its accessible name.
        -->
        <ArkSteps.Trigger
          class="steps__trigger"
          v-bind="props.showContent ? {} : { 'aria-controls': OMIT_ARIA }"
        >
          <ArkSteps.Indicator class="steps__indicator">
            <!--
              The tick replaces the number only once the step is complete;
              CSS hides whichever one does not apply.
            -->
            <span class="steps__indicator-number">
              <template v-if="variant === 'numbered'">{{ index + 1 }}</template>
            </span>
            <Icon name="check" :size="COMPLETE_ICON_SIZE" class="steps__indicator-check" />
          </ArkSteps.Indicator>
          <span class="steps__text">
            <span class="steps__title">{{ item.title }}</span>
            <span v-if="item.description" class="steps__description">{{ item.description }}</span>
          </span>
        </ArkSteps.Trigger>
        <ArkSteps.Separator class="steps__separator" />
      </ArkSteps.Item>
    </ArkSteps.List>

    <template v-if="showContent">
      <ArkSteps.Content
        v-for="(item, index) in steps"
        :key="item.title"
        :index="index"
        class="steps__content"
      >
        <template v-if="isString(item.content)">{{ item.content }}</template>
        <component :is="item.content" v-else-if="item.content" />
      </ArkSteps.Content>
      <ArkSteps.CompletedContent class="steps__content">
        <template v-if="isString(completedContent)">{{ completedContent }}</template>
        <component :is="completedContent" v-else-if="completedContent" />
      </ArkSteps.CompletedContent>
      <div class="steps__actions">
        <!--
          The two actions *are* the library Button, projected through Ark's
          `as-child` so they inherit every interactive token instead of
          restating them.
        -->
        <ArkSteps.PrevTrigger as-child>
          <Button intent="secondary" :size="size" type="button">Back</Button>
        </ArkSteps.PrevTrigger>
        <ArkSteps.NextTrigger as-child>
          <Button intent="primary" :size="size" type="button">Next</Button>
        </ArkSteps.NextTrigger>
      </div>
    </template>
  </ArkSteps.Root>
</template>
