<!--
  One field of the notation row: a small `Input` with the channel's
  abbreviation printed underneath it.

  It is the library's own `Input` rather than a bare `<input>` styled to look
  like one, so a control inside the popup picks up the same surface, hairline,
  radius, focus ring and disabled treatment as every other field in the system —
  and keeps them when that chrome moves.
-->
<script lang="ts">
  import type { ColorField } from "@ui-organized/core";
  import Input from "../Input/Input.svelte";
  import { readField, writeField, type ColorLike } from "./channelFields.js";

  let {
    field,
    color,
    onCommit,
    disabled,
    readOnly,
  }: {
    field: ColorField;
    color: ColorLike;
    onCommit: (next: ColorLike) => void;
    disabled?: boolean;
    readOnly?: boolean;
  } = $props();

  /* `null` means "show the colour". A string means the reader is mid-edit, and
     the colour must not overwrite what they are typing — which it otherwise
     would on every pointer move over the area behind the field. */
  let draft = $state<string | null>(null);

  const numeric = $derived(field.kind === "channel");
  const shown = $derived(draft ?? readField(field, color));

  function commit() {
    if (draft === null) return;
    const next = writeField(field, draft, color);
    draft = null;
    if (next) onCommit(next);
  }

  function onkeydown(event: KeyboardEvent) {
    if (event.key === "Enter") {
      event.preventDefault();
      commit();
    } else if (event.key === "Escape") {
      // Abandon the edit without closing the picker under it.
      event.stopPropagation();
      draft = null;
    }
  }
</script>

<div class="color-picker__field">
  <Input
    size="sm"
    type={numeric ? "number" : "text"}
    inputmode={numeric ? "decimal" : "text"}
    aria-label={field.label}
    spellcheck={false}
    autocomplete="off"
    {disabled}
    readonly={readOnly}
    min={field.kind === "channel" ? field.min : undefined}
    max={field.kind === "channel" ? field.max : undefined}
    step={field.kind === "channel" ? field.step : undefined}
    value={shown}
    oninput={(event) => (draft = (event.currentTarget as HTMLInputElement).value)}
    onfocus={(event) => (event.currentTarget as HTMLInputElement).select()}
    onblur={commit}
    {onkeydown}
  />
  <!--
    Only the numeric channels are abbreviated. A `HEX` caption under a hex field
    would only repeat the select above it — but the line stays reserved in CSS,
    so switching notation cannot resize the popup out from under the pointer.
  -->
  {#if numeric}
    <span class="color-picker__field-label" aria-hidden="true">{field.label}</span>
  {/if}
</div>
