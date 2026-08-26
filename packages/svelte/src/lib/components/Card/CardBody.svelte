<script lang="ts">
  import { clsx } from "clsx";
  import type { CardBodyProps } from "./Card.types.js";

  let { class: className, children, ...rest }: CardBodyProps = $props();
</script>

<div class={clsx("card__body", className)} {...rest}>
  {@render children?.()}
</div>
