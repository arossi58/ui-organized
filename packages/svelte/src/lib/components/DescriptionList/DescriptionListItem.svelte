<!-- One term and its details. -->
<script lang="ts">
  import { clsx } from "clsx";
  import type { DescriptionListItemProps } from "./DescriptionList.types.js";

  let { term, children, class: className, ...rest }: DescriptionListItemProps = $props();
</script>

<div class={clsx("description-list__item", className)} {...rest}>
  <dt class="description-list__term">{term}</dt>
  <dd class="description-list__details">{@render children?.()}</dd>
</div>
