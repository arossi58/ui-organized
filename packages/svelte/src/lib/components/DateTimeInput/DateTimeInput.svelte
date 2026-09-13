<!--
  A single-line date-and-time field — native `<input type="datetime-local">` on
  the Input field surface, with a leading calendar button that opens the DS
  calendar popover (with a time field beneath it) or the browser's own
  date/time picker on touch.
-->
<script lang="ts">
  import DateFieldBase from "../DateField/DateFieldBase.svelte";
  import type { DateTimeInputProps } from "./DateTimeInput.types.js";

  let { value = $bindable(), ...props }: DateTimeInputProps = $props();
</script>

<DateFieldBase
  type="datetime-local"
  pickerLabel="Choose date and time"
  bind:value
  {...props}
/>
