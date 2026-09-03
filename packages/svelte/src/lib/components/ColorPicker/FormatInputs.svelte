<!--
  The notation row under the sliders: a format select on a row of its own, and
  the fields for the notation it names underneath it.

  The select is the library's own `Select`, which means the picker opens a
  second surface above the one it is already showing. The dismissable-layer
  stack under all four libraries is built for exactly that — a select opened
  inside a dialog closes itself and leaves the dialog alone — so the picker
  stays open while the notation list is up.

  Which notations exist and which fields each one shows come from
  `COLOR_NOTATIONS` / `COLOR_NOTATION_FIELDS` in `@ui-organized/core`, shared
  with the React, Vue and Angular pickers so all four offer the same row.
-->
<script lang="ts">
  import { COLOR_NOTATIONS, COLOR_NOTATION_FIELDS, type ColorNotation } from "@ui-organized/core";
  import Select from "../Select/Select.svelte";
  import ChannelField from "./ChannelField.svelte";
  import type { ColorLike } from "./channelFields.js";

  let {
    format,
    onFormatChange,
    color,
    onCommit,
    disabled,
    readOnly,
    container,
  }: {
    format: ColorNotation;
    onFormatChange: (format: ColorNotation) => void;
    color: ColorLike;
    onCommit: (next: ColorLike) => void;
    disabled?: boolean;
    readOnly?: boolean;
    container?: HTMLElement | null;
  } = $props();
</script>

<div class="color-picker__notation">
  <!--
    The label is rendered and hidden in CSS rather than left off: Ark names the
    trigger, the listbox and the hidden `<select>` after the Label part, so an
    absent label leaves three dangling references behind.
  -->
  <Select
    class="color-picker__format"
    size="sm"
    label="Colour notation"
    options={COLOR_NOTATIONS}
    value={format}
    onValueChange={(value) => onFormatChange(value as ColorNotation)}
    {disabled}
    portalContainer={container ?? undefined}
  />

  <div class="color-picker__inputs" data-format={format}>
    {#each COLOR_NOTATION_FIELDS[format] as field (field.key)}
      <ChannelField {field} {color} {onCommit} {disabled} {readOnly} />
    {/each}
  </div>
</div>
