<script setup lang="ts">
import { computed, useAttrs } from "vue";
import { Carousel as ArkCarousel } from "@ark-ui/vue";
import { clsx } from "clsx";
import { carouselStyles } from "@ui-organized/core";
import { definedOnly } from "../../props.js";
import Button from "../Button/Button.vue";
import type { CarouselProps } from "./Carousel.types.js";
import "@ui-organized/core/components/Carousel/Carousel.css";

/**
 * Default gap between slides.
 *
 * zag resolves `spacing` into `--slide-spacing` at runtime and never sees the
 * token, but the *authored* default is still a token — so the gap is themed even
 * though the value zag computes from it is not.
 */
const DEFAULT_SPACING = "var(--spacing-space-04)";

defineOptions({ inheritAttrs: false });
// Every boolean forwarded to Ark below must default to `undefined`. Vue casts an
// absent Boolean prop to `false`, and `definedOnly` then forwards that as a
// deliberate choice — `loop` defaults to `!!autoplay` in the machine, so a cast
// would pin an autoplaying carousel to its last slide. See ../../props.ts.
// `showIndicators` is not forwarded but defaults to true, which the cast would
// also get wrong.
const props = withDefaults(defineProps<CarouselProps>(), {
  spacing: DEFAULT_SPACING,
  orientation: "horizontal",
  size: "md",
  variant: "default",
  showIndicators: true,
  loop: undefined,
  autoplay: undefined,
});
const emit = defineEmits<{
  "update:page": [page: number];
  pageChange: [page: number];
}>();

const attrs = useAttrs();
const rootClass = computed(() =>
  clsx(carouselStyles({ size: props.size, variant: props.variant }), attrs.class as string),
);

// `aria-label` rides along here rather than being bound on its own, because a
// bare `:aria-label="undefined"` in Vue *removes* an attribute rather than
// leaving it alone — see ../../props.ts.
const rootProps = computed(() =>
  definedOnly({
    page: props.page,
    defaultPage: props.defaultPage,
    slidesPerPage: props.slidesPerPage,
    loop: props.loop,
    autoplay: props.autoplay,
    "aria-label": props.label,
  }),
);

// Written here rather than inline: a Vue template expression cannot carry an
// object type annotation, and the handler's details argument needs one.
function onPageChange(details: { page: number }) {
  emit("update:page", details.page);
  emit("pageChange", details.page);
}
const isString = (v: unknown) => typeof v === "string";
</script>

<!--
  `slideCount` is derived, never a prop: a count out of step with `slides`
  desyncs the snap points silently.

  Reduced motion is not decided here. The autoplay timer is the machine's, and
  the only motion this package authors for Carousel is the indicator transition,
  which Carousel.css already drops under `prefers-reduced-motion: reduce`.
-->
<template>
  <ArkCarousel.Root
    :class="rootClass"
    :slide-count="slides.length"
    v-bind="rootProps"
    :spacing="spacing"
    :orientation="orientation"
    @page-change="onPageChange"
  >
    <ArkCarousel.ItemGroup class="carousel__items">
      <ArkCarousel.Item
        v-for="(slide, index) in slides"
        :key="slide.id"
        :index="index"
        class="carousel__item"
      >
        <template v-if="isString(slide.content)">{{ slide.content }}</template>
        <component :is="slide.content" v-else-if="slide.content" />
      </ArkCarousel.Item>
    </ArkCarousel.ItemGroup>

    <ArkCarousel.Control class="carousel__control">
      <!--
        The two arrows *are* the library Button, projected through Ark's
        `as-child` so they inherit every interactive token instead of restating
        them.
      -->
      <ArkCarousel.PrevTrigger v-if="variant !== 'minimal'" as-child>
        <Button intent="ghost" :size="size" icon="chevron-left" aria-label="Previous slide" />
      </ArkCarousel.PrevTrigger>

      <ArkCarousel.IndicatorGroup v-if="showIndicators" class="carousel__indicators">
        <ArkCarousel.Indicator
          v-for="(slide, index) in slides"
          :key="slide.id"
          :index="index"
          class="carousel__indicator"
          :aria-label="`Go to slide ${index + 1}`"
        />
      </ArkCarousel.IndicatorGroup>

      <ArkCarousel.NextTrigger v-if="variant !== 'minimal'" as-child>
        <Button intent="ghost" :size="size" icon="chevron-right" aria-label="Next slide" />
      </ArkCarousel.NextTrigger>
    </ArkCarousel.Control>
  </ArkCarousel.Root>
</template>
