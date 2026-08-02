import { Carousel as ArkCarousel } from "@ark-ui/react";
import { clsx } from "clsx";
import { Button } from "../Button/index.js";
import { carouselStyles } from "./Carousel.styles.js";
import type { CarouselProps } from "./Carousel.types.js";
import "./Carousel.css";

/**
 * Default gap between slides.
 *
 * zag resolves `spacing` into `--slide-spacing` at runtime and never sees the
 * token, but the *authored* default is still a token — so the gap is themed even
 * though the value zag computes from it is not.
 */
const DEFAULT_SPACING = "var(--spacing-space-04)";

export function Carousel({
  slides,
  label,
  page,
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
  className,
}: CarouselProps) {
  return (
    <ArkCarousel.Root
      className={clsx(carouselStyles({ size, variant }), className)}
      // `slideCount` is required by the machine and derived here, never exposed:
      // a count out of step with `slides` desyncs the snap points silently.
      slideCount={slides.length}
      page={page}
      defaultPage={defaultPage}
      onPageChange={onPageChange && ((details) => onPageChange(details.page))}
      slidesPerPage={slidesPerPage}
      spacing={spacing}
      loop={loop}
      autoplay={autoplay}
      orientation={orientation}
      aria-label={label}
    >
      <ArkCarousel.ItemGroup className="carousel__items">
        {slides.map((slide, index) => (
          <ArkCarousel.Item key={slide.id} index={index} className="carousel__item">
            {slide.content}
          </ArkCarousel.Item>
        ))}
      </ArkCarousel.ItemGroup>

      <ArkCarousel.Control className="carousel__control">
        {variant !== "minimal" && (
          <ArkCarousel.PrevTrigger asChild>
            <Button intent="ghost" size={size} icon="chevron-left" aria-label="Previous slide" />
          </ArkCarousel.PrevTrigger>
        )}

        {showIndicators && (
          <ArkCarousel.IndicatorGroup className="carousel__indicators">
            {slides.map((slide, index) => (
              <ArkCarousel.Indicator
                key={slide.id}
                index={index}
                className="carousel__indicator"
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </ArkCarousel.IndicatorGroup>
        )}

        {variant !== "minimal" && (
          <ArkCarousel.NextTrigger asChild>
            <Button intent="ghost" size={size} icon="chevron-right" aria-label="Next slide" />
          </ArkCarousel.NextTrigger>
        )}
      </ArkCarousel.Control>
    </ArkCarousel.Root>
  );
}
