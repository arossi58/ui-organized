<script lang="ts">
  import { Field } from "@ark-ui/svelte";
  import { clsx } from "clsx";
  import { CONTROL_ICON_SIZE, inputFieldStyles } from "@ui-organized/core";
  import FieldError from "../FieldError/FieldError.svelte";
  import Icon from "../Icon/Icon.svelte";
  import type { InputProps } from "./Input.types.js";
  // The shared field chrome, ahead of this component's own sheet, which may override it.
  import "@ui-organized/core/components/Field/Field.css";
  import "@ui-organized/core/components/Input/Input.css";
  import "@ui-organized/core/components/Input/InputAffix.css";
  import { onMount, type Snippet } from "svelte";
  import { trackFocusModality } from "@ui-organized/core/focus-modality";

  // Text fields read pointer vs keyboard for a quiet focus state on click.
  onMount(() => trackFocusModality());

  let {
    label,
    helperText,
    error,
    size,
    required,
    id,
    class: className,
    value = $bindable(),
    startIcon,
    endIcon,
    startAddon,
    endAddon,
    ...inputProps
  }: InputProps = $props();

  const iconSize = $derived(CONTROL_ICON_SIZE[size ?? "md"]);
  const hasIcons = $derived(startIcon != null || endIcon != null);
  const hasAddons = $derived(startAddon != null || endAddon != null);
  // React uses useId() here; this is Svelte's equivalent.
  const uid = $props.id();
  const addonId = (side: "start" | "end") => `${uid}-${side}-addon`;
  // A text add-on is part of the value (`https://`, `.com`), so it describes the
  // control. Ark writes the field's own aria-describedby and a prop would replace
  // it, so the two are joined through Field.Context.
  const addonIds = $derived(
    [typeof startAddon === "string" && addonId("start"), typeof endAddon === "string" && addonId("end")].filter(
      (v): v is string => !!v,
    ),
  );

  const isInvalid = $derived(!!error);
  const errorMessage = $derived(typeof error === "string" ? error : undefined);
</script>

{#snippet input(describedBy?: string)}
  <Field.Input
    class={clsx(
      "field__control",
      startIcon != null && "field__control--affix-start",
      endIcon != null && "field__control--affix-end",
    )}
    {required}
    bind:value
    {...inputProps}
    {...describedBy ? { "aria-describedby": describedBy } : {}}
  />
{/snippet}
{#snippet control()}
  {#if addonIds.length}
    <Field.Context>
      {#snippet render(field)}
        {@render input(
          [...addonIds, field()?.ariaDescribedby, inputProps["aria-describedby"]].filter(Boolean).join(" "),
        )}
      {/snippet}
    </Field.Context>
  {:else}
    {@render input()}
  {/if}
{/snippet}
{#snippet affixed()}
  {#if hasIcons}
    <div class="input-affix">
      {#if startIcon != null}
        <span class="input-affix__adornment input-affix__adornment--start" aria-hidden="true">
          <Icon name={startIcon} size={iconSize} />
        </span>
      {/if}
      {@render control()}
      {#if endIcon != null}
        <span class="input-affix__adornment input-affix__adornment--end" aria-hidden="true">
          <Icon name={endIcon} size={iconSize} />
        </span>
      {/if}
    </div>
  {:else}
    {@render control()}
  {/if}
{/snippet}
{#snippet addon(side: "start" | "end", content: string | Snippet)}
  <div
    id={typeof content === "string" ? addonId(side) : undefined}
    class={clsx("field__addon", `field__addon--${side}`, typeof content !== "string" && "field__addon--slot")}
  >
    {#if typeof content === "string"}{content}{:else}{@render content()}{/if}
  </div>
{/snippet}

<Field.Root class={clsx(inputFieldStyles({ size }), className)} invalid={isInvalid} {id}>
  {#if label}
    <Field.Label class="field__label">
      {label}
      {#if required}<span class="field__required" aria-hidden="true"></span>{/if}
    </Field.Label>
  {/if}
  {#if hasAddons}
    <div class="field__group">
      {#if startAddon != null}{@render addon("start", startAddon)}{/if}
      {@render affixed()}
      {#if endAddon != null}{@render addon("end", endAddon)}{/if}
    </div>
  {:else}
    {@render affixed()}
  {/if}
  {#if helperText && !isInvalid}
    <Field.HelperText class="field__description">{helperText}</Field.HelperText>
  {/if}
  {#if isInvalid && errorMessage}
    <!--
      Ark's ErrorText renders only while the Field is invalid, and `asChild`
      hands its props to whatever we render in its place — here the shared
      FieldError, so the message keeps its icon and its aria-describedby wiring.
    -->
    <Field.ErrorText>
      {#snippet asChild(props)}
        <FieldError {...props()} message={errorMessage} />
      {/snippet}
    </Field.ErrorText>
  {/if}
</Field.Root>
