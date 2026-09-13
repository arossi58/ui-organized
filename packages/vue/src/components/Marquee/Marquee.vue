<script setup lang="ts">
import { computed, useAttrs } from "vue";
import { Marquee as ArkMarquee } from "@ark-ui/vue";
import { clsx } from "clsx";
import { marqueeStyles } from "@ui-organized/core";
import { definedOnly } from "../../props.js";
import type { MarqueeProps } from "./Marquee.types.js";
import "@ui-organized/core/components/Marquee/Marquee.css";

/** Authored default gap. zag resolves it into `--marquee-spacing` at runtime,
 *  so the value it computes with is not a token — but the one we author is. */
const DEFAULT_SPACING = "var(--spacing-space-04)";

/**
 * The machine has no `orientation`; it has `side`, which is the direction of
 * travel and implies the axis. The library uses `orientation` everywhere else,
 * so the public prop keeps that name and the default side for each axis is
 * chosen here. `reverse` flips the direction within the axis.
 */
const SIDE_BY_ORIENTATION = {
  horizontal: "start",
  vertical: "top",
} as const;

defineOptions({ inheritAttrs: false });
// Every boolean forwarded to Ark below must default to `undefined`. Vue casts an
// absent Boolean prop to `false`, and `definedOnly` then forwards that as a
// deliberate choice — see ../../props.ts. `autoFill` and `showEdges` are the two
// that default to *true*, which the cast would silently turn off.
const props = withDefaults(defineProps<MarqueeProps>(), {
  spacing: DEFAULT_SPACING,
  orientation: "horizontal",
  autoFill: true,
  showEdges: true,
  reverse: undefined,
  pauseOnInteraction: undefined,
  defaultPaused: undefined,
});
const emit = defineEmits<{
  complete: [];
  loopComplete: [];
}>();

const attrs = useAttrs();
const rootClass = computed(() =>
  clsx(marqueeStyles({ orientation: props.orientation }), attrs.class as string),
);

const rootProps = computed(() =>
  definedOnly({
    speed: props.speed,
    delay: props.delay,
    reverse: props.reverse,
    pauseOnInteraction: props.pauseOnInteraction,
    defaultPaused: props.defaultPaused,
    loopCount: props.loopCount,
  }),
);

const isString = (v: unknown) => typeof v === "string";

/**
 * Known gap, upstream: `pauseOnInteraction` pauses under the pointer here but
 * not on keyboard focus.
 *
 * zag's machine hands the root `onFocusCapture` / `onBlurCapture`, and
 * `@zag-js/vue`'s normalizer lowercases everything after the first letter, so
 * they arrive as `onFocuscapture` / `onBlurcapture`. Vue's own capture modifier
 * is matched by `/(?:Once|Passive|Capture)$/` — a capital C — so it does not
 * recognise those and instead binds listeners for events literally named
 * "focuscapture" and "blurcapture", which nothing ever fires. React and Svelte
 * both wire the same props up correctly; this is the Vue adapter alone.
 *
 * Deliberately not worked around. A hand-rolled `@focusin`/`@focusout` pair here
 * would have to drive `paused` as a controlled value, which fights both
 * `defaultPaused` and the pointer handling the machine already owns — and it
 * would double-pause the moment upstream fixes the normalizer. The pointer path
 * is pinned in Marquee.test.ts; when this is fixed, the focus path belongs in
 * the same file.
 */
</script>

<!--
  Reduced motion is handled entirely in Marquee.css, which drops the animation
  under `prefers-reduced-motion: reduce` — continuous motion with no way to stop
  it is a WCAG 2.2.2 failure. Forcing `defaultPaused` here instead would make the
  component disagree with its own stylesheet and would leak a media query into
  SSR, where there is no media to query.
-->
<template>
  <ArkMarquee.Root
    :class="rootClass"
    v-bind="rootProps"
    :side="SIDE_BY_ORIENTATION[orientation]"
    :spacing="spacing"
    :auto-fill="autoFill"
    @complete="emit('complete')"
    @loop-complete="emit('loopComplete')"
  >
    <template v-if="showEdges">
      <ArkMarquee.Edge side="start" class="marquee__edge" />
      <ArkMarquee.Edge side="end" class="marquee__edge" />
    </template>
    <ArkMarquee.Viewport class="marquee__viewport">
      <!--
        One Content, not one per copy. Ark's Content renders itself
        `api.contentCount` times — the machine decides how many passes are
        needed to fill the track from the measured content and `autoFill` — and
        tags every duplicate `data-clone` so it stays out of the accessibility
        tree. Looping here would duplicate the duplicates.
      -->
      <ArkMarquee.Content class="marquee__content">
        <ArkMarquee.Item v-for="item in items" :key="item.id" class="marquee__item">
          <template v-if="isString(item.content)">{{ item.content }}</template>
          <component :is="item.content" v-else-if="item.content" />
        </ArkMarquee.Item>
      </ArkMarquee.Content>
    </ArkMarquee.Viewport>
  </ArkMarquee.Root>
</template>
