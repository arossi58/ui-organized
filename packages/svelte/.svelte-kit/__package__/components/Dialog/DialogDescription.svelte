<script lang="ts">
  import { Dialog as ArkDialog } from "@ark-ui/svelte";
  import { clsx } from "clsx";
  import type { DialogDescriptionProps } from "./Dialog.types.js";

  let { class: className, children, ...rest }: DialogDescriptionProps = $props();
</script>

<ArkDialog.Description
  class={clsx("dialog__description", "text-default-body-medium", className)}
  {...rest}
>
  {@render children?.()}
</ArkDialog.Description>
