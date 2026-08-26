<!--
  Shared single date/time field used by DateInput and DateTimeInput.

  Internal: not exported from the package barrel and given no parity case, since
  its whole public DOM is DateInput's and DateTimeInput's.

  The native `<input>` keeps full functionality (typing, value, min/max). The
  leading calendar button opens the DS-styled calendar popover on fine pointers
  (mouse), or the OS-native picker on touch devices. For datetime the popover
  adds a time field beneath the calendar.
-->
<script lang="ts">
  import { Field, Popover as ArkPopover } from "@ark-ui/svelte";
  import { clsx } from "clsx";
  import {
    CONTROL_ICON_SIZE,
    inputFieldStyles,
    parseISODate,
    popupControls,
    toISODate,
    todayYMD,
    type YMD,
  } from "@ui-organized/core";
  import Button from "../Button/Button.svelte";
  import Icon from "../Icon/Icon.svelte";
  import FieldError from "../FieldError/FieldError.svelte";
  import Calendar from "../Calendar/Calendar.svelte";
  import DatePopover from "./DatePopover.svelte";
  import { datePopoverPositioning } from "./datePopoverPositioning.js";
  import { openDatePicker } from "./openDatePicker.js";
  import { setNativeInputValue } from "./setNativeInputValue.js";
  import { useCoarsePointer } from "./useCoarsePointer.svelte.js";
  import type { DateFieldBaseProps } from "./DateFieldBase.types.js";
  // Shares the Input field surface/state styling; InputAffix.css supplies the
  // leading calendar button and hides the native picker chrome.
  import "@ui-organized/core/components/Input/Input.css";
  import "@ui-organized/core/components/Input/InputAffix.css";

  let {
    type,
    pickerLabel,
    label,
    helperText,
    error,
    size,
    required,
    class: className,
    disabled,
    value = $bindable(),
    defaultValue,
    oninput,
    min,
    max,
    portalContainer,
    ...inputProps
  }: DateFieldBaseProps = $props();

  const isInvalid = $derived(!!error);
  const errorMessage = $derived(typeof error === "string" ? error : undefined);
  const isDateTime = $derived(type === "datetime-local");
  const iconSize = $derived(CONTROL_ICON_SIZE[size ?? "md"]);

  const coarse = useCoarsePointer();

  let open = $state(false);
  let inputEl = $state<HTMLInputElement | null>(null);
  let fieldEl = $state<HTMLDivElement | null>(null);
  let activeDayEl = $state<HTMLButtonElement | null>(null);

  // Track the value so the calendar mirrors typed edits and can write back.
  // React needs a mirror plus an effect to re-sync it; here the prop is bindable,
  // so a consumer who binds shares this variable outright and one who does not
  // gets it as local state — either way there is a single copy.
  // svelte-ignore state_referenced_locally
  let internalValue = $state(String((value ?? defaultValue) ?? ""));
  $effect(() => {
    if (value !== undefined) internalValue = String(value);
  });

  function handleInput(event: Event & { currentTarget: HTMLInputElement }) {
    internalValue = event.currentTarget.value;
    // Written unconditionally, not only when `value` is already set: DateInput
    // and DateTimeInput reach this through `bind:value`, and a consumer whose
    // own variable starts out `undefined` would otherwise never see a keystroke.
    value = internalValue;
    oninput?.(event);
  }

  const minStr = $derived(typeof min === "string" ? min : undefined);
  const maxStr = $derived(typeof max === "string" ? max : undefined);
  const datePart = $derived(internalValue.split("T")[0] ?? "");
  const timePart = $derived(internalValue.split("T")[1] ?? "");

  function handleDaySelect(day: YMD) {
    const iso = toISODate(day);
    if (isDateTime) {
      setNativeInputValue(inputEl, `${iso}T${timePart || "00:00"}`);
      // Keep the popover open so the time can still be set.
    } else {
      setNativeInputValue(inputEl, iso);
      open = false;
    }
  }

  function handleTimeChange(event: Event & { currentTarget: HTMLInputElement }) {
    const day = datePart || toISODate(todayYMD());
    setNativeInputValue(inputEl, `${day}T${event.currentTarget.value}`);
  }
</script>

{#snippet control()}
  <Field.Input
    bind:ref={inputEl}
    {type}
    class="field__control field__control--affix-start"
    data-empty={internalValue ? undefined : true}
    {required}
    {disabled}
    value={internalValue}
    {min}
    {max}
    {...inputProps}
    oninput={handleInput}
  />
{/snippet}

{#snippet pickerButton(onclick: (() => void) | undefined)}
  <button
    type="button"
    class="input-affix__adornment input-affix__adornment--start input-affix__action"
    {onclick}
    {disabled}
    aria-label={pickerLabel}
  >
    <Icon name="calendar" size={iconSize} />
  </button>
{/snippet}

<Field.Root class={clsx(inputFieldStyles({ size }), className)} invalid={isInvalid}>
  {#if label}
    <Field.Label class="field__label">
      {label}
      {#if required}<span class="field__required" aria-hidden="true"></span>{/if}
    </Field.Label>
  {/if}

  {#if coarse()}
    <div class="input-affix" bind:this={fieldEl}>
      {@render pickerButton(() => openDatePicker(inputEl))}
      {@render control()}
    </div>
  {:else}
    <ArkPopover.Root
      bind:open
      positioning={datePopoverPositioning(() => fieldEl)}
      initialFocusEl={() => activeDayEl}
    >
      <div class="input-affix" bind:this={fieldEl}>
        <!--
          Ark keeps aria-controls on the trigger at all times, but the popup it
          names is only mounted while open; popupControls drops it while closed.
        -->
        <ArkPopover.Trigger {...popupControls(open)}>
          {#snippet asChild(props)}
            <button
              {...props({
                type: "button",
                class:
                  "input-affix__adornment input-affix__adornment--start input-affix__action",
                disabled,
                "aria-label": pickerLabel,
              })}
            >
              <Icon name="calendar" size={iconSize} />
            </button>
          {/snippet}
        </ArkPopover.Trigger>
        {@render control()}
      </div>
      <DatePopover container={portalContainer} label={pickerLabel}>
        <Calendar
          mode="single"
          value={parseISODate(datePart)}
          min={parseISODate(minStr)}
          max={parseISODate(maxStr)}
          onSelect={handleDaySelect}
          onActiveDay={(el) => (activeDayEl = el)}
        />
        {#if isDateTime}
          <div class="date-popover__footer">
            <input
              type="time"
              class="field__control date-popover__time"
              data-empty={timePart ? undefined : true}
              value={timePart}
              oninput={handleTimeChange}
              aria-label="Time"
            />
            <Button
              type="button"
              intent="primary"
              size="md"
              class="date-popover__done"
              onclick={() => (open = false)}
            >
              Done
            </Button>
          </div>
        {/if}
      </DatePopover>
    </ArkPopover.Root>
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
