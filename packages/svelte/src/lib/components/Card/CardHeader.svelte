<script lang="ts">
  import { clsx } from "clsx";
  import type { CardHeaderProps } from "./Card.types.js";

  let { class: className, children, ...rest }: CardHeaderProps = $props();
</script>

<div class={clsx("card__header", className)} {...rest}>
  {@render children?.()}
</div>
