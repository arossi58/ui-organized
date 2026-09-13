<!--
  A single-line date field — native `<input type="date">` on the Input field
  surface, with a leading calendar button that opens the DS calendar popover
  (fine pointers) or the browser's own date picker (touch).
-->
<script lang="ts">
  import DateFieldBase from "../DateField/DateFieldBase.svelte";
  import type { DateInputProps } from "./DateInput.types.js";

  let { value = $bindable(), ...props }: DateInputProps = $props();
</script>

<DateFieldBase type="date" pickerLabel="Choose date" bind:value {...props} />
