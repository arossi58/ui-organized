import { clsx } from "clsx";
import { skeletonStyles } from "./Skeleton.styles.js";
import type { SkeletonProps } from "./Skeleton.types.js";
import "./Skeleton.css";

/** A number is treated as pixels; strings pass through as-is. */
function toCssSize(value?: number | string): string | undefined {
  if (value == null) return undefined;
  return typeof value === "number" ? `${value}px` : value;
}

/**
 * Loading placeholder. Renders a shimmering block sized to the eventual content.
 * For multi-line text, pass `lines` to render a stack with a shortened last row.
 */
export function Skeleton({
  variant = "text",
  width,
  height,
  lines = 1,
  animated = true,
  className,
  style,
  ...props
}: SkeletonProps) {
  const w = toCssSize(width);
  const h = toCssSize(height);

  if (variant === "text" && lines > 1) {
    return (
      <div className={clsx("skeleton-group", className)} style={style} aria-hidden="true" {...props}>
        {Array.from({ length: lines }).map((_, i) => (
          <span
            key={i}
            className={skeletonStyles({ variant, animated })}
            style={{ width: i === lines - 1 ? "60%" : w ?? "100%", height: h }}
          />
        ))}
      </div>
    );
  }

  return (
    <span
      className={clsx(skeletonStyles({ variant, animated }), className)}
      style={{ width: w, height: h, ...style }}
      aria-hidden="true"
      {...props}
    />
  );
}
