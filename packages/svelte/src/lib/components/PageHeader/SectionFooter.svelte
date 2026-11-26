<!-- The row that closes a section: a status line at the start, its actions at the end. -->
<script lang="ts">
  import { clsx } from "clsx";
  import { SECTION_FOOTER_TEXT_CLASS, sectionFooterStyles } from "@ui-organized/core";
  import type { SectionFooterProps } from "./PageHeader.types.js";
  import "@ui-organized/core/components/PageHeader/PageHeader.css";

  let { children, actions, divided, class: className, ...rest }: SectionFooterProps = $props();
</script>

<div class={clsx(sectionFooterStyles({ divided }), className)} {...rest}>
  {#if children}<div class={clsx("section-footer__content", SECTION_FOOTER_TEXT_CLASS)}>{@render children()}</div>{/if}
  {#if actions}<div class="section-footer__actions">{@render actions()}</div>{/if}
</div>
