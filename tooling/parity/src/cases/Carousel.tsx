import type { ComponentType } from "react";
import { Carousel as RCarousel } from "@ui-organized/react";
import CarouselFixture from "../fixtures/CarouselFixture.svelte";
import VueCarouselFixture from "../fixtures/vue/CarouselFixture.vue";
import { SIZES, type ParitySpec } from "./spec.js";

/**
 * Slide content is plain strings throughout — see the note in Splitter.tsx for
 * why the one value all four libraries accept unchanged is the one the cases
 * state.
 *
 * What a static render *can* pin here is everything the machine decides before
 * it has measured anything: the snap points derived from `slideCount`, which
 * indicator is `data-current`, and whether either arrow is `disabled`. The
 * scroll position, `data-inview` and the drag state all need a real layout and
 * belong to the browser harness.
 */
const spec: ParitySpec = {
  component: "Carousel",
  react: (p) => <RCarousel {...(p as any)} />,
  svelte: CarouselFixture as unknown as ComponentType<any>,
  vue: VueCarouselFixture as unknown as ComponentType<any>,
  cases: (() => {
    const slides = [
      { id: "a", content: "First" },
      { id: "b", content: "Second" },
      { id: "c", content: "Third" },
    ];
    return [
      { name: "default", props: { slides } },
      { name: "single slide", props: { slides: [{ id: "only", content: "Just this" }] } },
      { name: "accessible label", props: { slides, label: "Featured work" } },
      // Both arrows are `disabled` at either end of a non-looping carousel, and
      // `disabled` is what the caller sees change.
      { name: "second page", props: { slides, defaultPage: 1 } },
      { name: "last page", props: { slides, defaultPage: 2 } },
      { name: "controlled page", props: { slides, page: 1 } },
      { name: "slides per page", props: { slides, slidesPerPage: 2 } },
      { name: "custom spacing", props: { slides, spacing: "2rem" } },
      { name: "loop", props: { slides, loop: true } },
      /**
       * The one case that catches a Vue Boolean cast.
       *
       * `loop` is not independent of `autoplay`: the machine defaults it to
       * `!!autoplay`, so an autoplaying carousel wraps unless told otherwise.
       * A framework that turns an absent `loop` into a literal `false` replaces
       * that derivation with a decision the caller never made, and the symptom
       * is the previous arrow rendering `disabled` on the first slide. The
       * autoplay state also flips the item group's `aria-live` to "off", so
       * this row pins both halves.
       */
      { name: "autoplay", props: { slides, autoplay: true } },
      { name: "autoplay with delay", props: { slides, autoplay: { delay: 2000 } } },
      // Explicit `loop: false` alongside autoplay: the caller overriding the
      // derivation is a different thing from the framework losing it.
      { name: "autoplay without loop", props: { slides, autoplay: true, loop: false } },
      ...(["horizontal", "vertical"] as const).map((orientation) => ({
        name: `orientation/${orientation}`,
        props: { slides, orientation },
      })),
      // The size reaches two places at once: the root recipe and the intent of
      // the arrows, which are the library Button projected through Ark's asChild.
      ...SIZES.map((size) => ({ name: `size/${size}`, props: { slides, size } })),
      // `minimal` drops both arrows and leaves the indicator row alone, so the
      // two branches of the control row are both pinned.
      ...(["default", "minimal"] as const).map((variant) => ({
        name: `variant/${variant}`,
        props: { slides, variant },
      })),
      { name: "no indicators", props: { slides, showIndicators: false } },
      { name: "minimal without indicators", props: { slides, variant: "minimal", showIndicators: false } },
      { name: "custom class", props: { slides, className: "mine" } },
    ];
  })(),
};

export default spec;
