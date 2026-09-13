<script lang="ts">
  import { Dialog as ArkDialog } from "@ark-ui/svelte";
  import { clsx } from "clsx";
  import type { DialogTitleProps } from "./Dialog.types.js";

  let { class: className, children, ...rest }: DialogTitleProps = $props();
</script>

<ArkDialog.Title class={clsx("dialog__title", "text-strong-heading-small", className)} {...rest}>
  {@render children?.()}
</ArkDialog.Title>
