<script lang="ts">
  import { clsx } from "clsx";
  import { cardStyles } from "@ui-organized/core";
  import type { CardProps } from "./Card.types.js";
  import "@ui-organized/core/components/Card/Card.css";

  let { variant, padding, class: className, children, ...rest }: CardProps = $props();
</script>

<div class={clsx(cardStyles({ variant, padding }), className)} {...rest}>
  {@render children?.()}
</div>
