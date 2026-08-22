<!--
  Error message wired to the field's validity. Renders through the shared
  FieldError (icon + tinted pill). Ark's ErrorText shows only while the Field is
  invalid, so no explicit match condition is needed.

  The two branches are not redundant. FieldError decides whether it has anything
  to show by checking `children` first and falling back to `message`, so handing
  it a `children` snippet that happens to render nothing — which is what an
  unconditional `{#if children}` block does — makes it believe it has content and
  render an empty pill. A snippet cannot be tested for emptiness from outside, so
  the only way to say "no children" is not to pass any.
-->
<script lang="ts">
  import { Field as ArkField } from "@ark-ui/svelte";
  import FieldError from "../FieldError/FieldError.svelte";
  import type { FieldErrorMessageProps } from "./Field.types.js";

  let { class: className, message, children, ...rest }: FieldErrorMessageProps = $props();
</script>

<ArkField.ErrorText>
  {#snippet asChild(props)}
    {#if children}
      <FieldError {...props()} class={className} {...rest}>
        {@render children()}
      </FieldError>
    {:else}
      <FieldError {...props()} class={className} {message} {...rest} />
    {/if}
  {/snippet}
</ArkField.ErrorText>
