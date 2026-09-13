<script lang="ts">
  import { Carousel as ArkCarousel } from "@ark-ui/svelte";
  import { clsx } from "clsx";
  import { carouselStyles } from "@ui-organized/core";
  import Button from "../Button/Button.svelte";
  import type { CarouselProps } from "./Carousel.types.js";
  import "@ui-organized/core/components/Carousel/Carousel.css";

  /**
   * Default gap between slides.
   *
   * zag resolves `spacing` into `--slide-spacing` at runtime and never sees the
   * token, but the *authored* default is still a token — so the gap is themed
   * even though the value zag computes from it is not.
   */
  const DEFAULT_SPACING = "var(--spacing-space-04)";

  let {
    slides,
    label,
    page = $bindable(),
    defaultPage,
    onPageChange,
    slidesPerPage,
    spacing = DEFAULT_SPACING,
    loop,
    autoplay,
    orientation = "horizontal",
    size = "md",
    variant = "default",
    showIndicators = true,
    class: className,
  }: CarouselProps = $props();

  /* Reduced motion is not decided here. The autoplay timer is the machine's,
     and the only motion this package authors for Carousel is the indicator
     transition — which Carousel.css already drops under
     `prefers-reduced-motion: reduce`. Adding a policy in the component would
     put two different answers in the system. */
</script>

<!--
  `slideCount` is derived, never a prop: a count out of step with `slides`
  desyncs the snap points silently.
-->
<ArkCarousel.Root
  class={clsx(carouselStyles({ size, variant }), className)}
  slideCount={slides.length}
  bind:page
  {defaultPage}
  onPageChange={onPageChange && ((details) => onPageChange(details.page))}
  {slidesPerPage}
  {spacing}
  {loop}
  {autoplay}
  {orientation}
  aria-label={label}
>
  <ArkCarousel.ItemGroup class="carousel__items">
    {#each slides as slide, index (slide.id)}
      <ArkCarousel.Item {index} class="carousel__item">
        {#if typeof slide.content === "string"}{slide.content}{:else}{@render slide.content?.()}{/if}
      </ArkCarousel.Item>
    {/each}
  </ArkCarousel.ItemGroup>

  <ArkCarousel.Control class="carousel__control">
    {#if variant !== "minimal"}
      <!--
        The two arrows *are* the library Button, projected through Ark's
        asChild so they inherit every interactive token instead of restating
        them. `class` is pulled out and handed over separately because Ark
        types the projected props in Svelte's own shapes, where it is a
        `ClassValue` that may be null while the Button takes a string.
      -->
      <ArkCarousel.PrevTrigger>
        {#snippet asChild(props)}
          {@const { class: arkClass, ...triggerProps } = props()}
          <Button
            intent="ghost"
            {size}
            icon="chevron-left"
            aria-label="Previous slide"
            class={clsx(arkClass)}
            {...triggerProps}
          />
        {/snippet}
      </ArkCarousel.PrevTrigger>
    {/if}

    {#if showIndicators}
      <ArkCarousel.IndicatorGroup class="carousel__indicators">
        {#each slides as slide, index (slide.id)}
          <ArkCarousel.Indicator
            {index}
            class="carousel__indicator"
            aria-label={`Go to slide ${index + 1}`}
          />
        {/each}
      </ArkCarousel.IndicatorGroup>
    {/if}

    {#if variant !== "minimal"}
      <ArkCarousel.NextTrigger>
        {#snippet asChild(props)}
          {@const { class: arkClass, ...triggerProps } = props()}
          <Button
            intent="ghost"
            {size}
            icon="chevron-right"
            aria-label="Next slide"
            class={clsx(arkClass)}
            {...triggerProps}
          />
        {/snippet}
      </ArkCarousel.NextTrigger>
    {/if}
  </ArkCarousel.Control>
</ArkCarousel.Root>
