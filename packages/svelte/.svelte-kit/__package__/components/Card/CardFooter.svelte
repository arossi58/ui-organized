<script lang="ts">
  import { clsx } from "clsx";
  import type { CardFooterProps } from "./Card.types.js";

  let { class: className, children, ...rest }: CardFooterProps = $props();
</script>

<div class={clsx("card__footer", className)} {...rest}>
  {@render children?.()}
</div>
