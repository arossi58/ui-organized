<!--
  An indeterminate loading indicator: a turning ring in the current text
  colour. For work whose progress can be measured, use Progress; for content
  whose shape is known before it arrives, use Skeleton.
-->
<script lang="ts">
  import { clsx } from "clsx";
  import { spinnerStyles } from "@ui-organized/core";
  import type { SpinnerProps } from "./Spinner.types.js";
  import "@ui-organized/core/components/Spinner/Spinner.css";

  let {
    size = "md",
    label = "Loading",
    decorative = false,
    class: className,
    ...rest
  }: SpinnerProps = $props();
</script>

<span
  class={clsx(spinnerStyles({ size }), className)}
  role={decorative ? undefined : "status"}
  aria-label={decorative ? undefined : label}
  aria-hidden={decorative ? "true" : undefined}
  {...rest}
></span>
