<!--
  A from–to date range built from two native `<input type="date">` controls on
  the Input field surface, under one shared label, helper text and error.

  On fine pointers the leading calendar buttons open one shared DS-styled
  two-month range calendar; on touch devices they defer to the OS-native picker.
  The two ends auto-constrain each other (the end can't precede the start) on top
  of the optional `min` / `max` bounds. Works bound (`bind:value`) or
  uncontrolled (`defaultValue`).
-->
<script lang="ts">
  import type { Snippet } from "svelte";
  import { Popover as ArkPopover } from "@ark-ui/svelte";
  import { clsx } from "clsx";
  import {
    CONTROL_ICON_SIZE,
    inputFieldStyles,
    parseISODate,
    popupControls,
    toISODate,
  } from "@ui-organized/core";
  import Icon from "../Icon/Icon.svelte";
  import FieldError from "../FieldError/FieldError.svelte";
  import Calendar from "../Calendar/Calendar.svelte";
  import DatePopover from "../DateField/DatePopover.svelte";
  import { datePopoverPositioning } from "../DateField/datePopoverPositioning.js";
  import { openDatePicker } from "../DateField/openDatePicker.js";
  import { useCoarsePointer } from "../DateField/useCoarsePointer.svelte.js";
  import type { DateRangeInputProps, DateRangeValue } from "./DateRangeInput.types.js";
  // Shares the Input field surface/state styling; InputAffix.css supplies the
  // leading calendar buttons; DateRangeInput.css lays out the start/end pair.
  import "@ui-organized/core/components/Input/Input.css";
  import "@ui-organized/core/components/Input/InputAffix.css";
  import "@ui-organized/core/components/DateRangeInput/DateRangeInput.css";

  let {
    label,
    helperText,
    error,
    size,
    required,
    disabled,
    value = $bindable(),
    defaultValue,
    onChange,
    min,
    max,
    startName,
    endName,
    startLabel = "Start date",
    endLabel = "End date",
    separator = "–",
    class: className,
    id,
    portalContainer,
  }: DateRangeInputProps = $props();

  const isInvalid = $derived(!!error);
  const errorMessage = $derived(typeof error === "string" ? error : undefined);
  const iconSize = $derived(CONTROL_ICON_SIZE[size ?? "md"]);

  // React uses useId() here; this is Svelte's equivalent. The group is a plain
  // <div role="group">, so its name and description have to be wired by hand.
  const generatedId = $props.id();
  const labelId = `${generatedId}-label`;
  const helperId = `${generatedId}-helper`;
  const errorId = `${generatedId}-error`;

  const coarse = useCoarsePointer();

  let open = $state(false);
  let rowEl = $state<HTMLDivElement | null>(null);
  let activeDayEl = $state<HTMLButtonElement | null>(null);
  let startEl = $state<HTMLInputElement | null>(null);
  let endEl = $state<HTMLInputElement | null>(null);

  // `defaultValue` seeds the uncontrolled range once and is not tracked after
  // that — a later change to it must not overwrite what the user has picked.
  // svelte-ignore state_referenced_locally
  let internal = $state<DateRangeValue>({
    start: (value ?? defaultValue)?.start ?? "",
    end: (value ?? defaultValue)?.end ?? "",
  });
  const current = $derived<DateRangeValue>(
    value ? { start: value.start ?? "", end: value.end ?? "" } : internal,
  );

  function update(next: DateRangeValue) {
    if (value !== undefined) value = next;
    else internal = next;
    onChange?.(next);
  }

  /**
   * Captures each end's DOM node so the touch path can call `showPicker()` on
   * it. An action rather than `bind:this`, because the two inputs are rendered
   * from one snippet and the binding target has to be chosen per call.
   */
  function captureInput(node: HTMLInputElement, side: "start" | "end") {
    if (side === "start") startEl = node;
    else endEl = node;
    return {
      destroy() {
        if (side === "start") startEl = null;
        else endEl = null;
      },
    };
  }

  const describedBy = $derived(
    [
      helperText && !isInvalid ? helperId : null,
      isInvalid && errorMessage ? errorId : null,
    ]
      .filter(Boolean)
      .join(" ") || undefined,
  );
</script>

{#snippet calendarIconButton(onclick: (() => void) | undefined, ariaLabel: string)}
  <button
    type="button"
    class="input-affix__adornment input-affix__adornment--start input-affix__action"
    {onclick}
    {disabled}
    aria-label={ariaLabel}
  >
    <Icon name="calendar" size={iconSize} />
  </button>
{/snippet}

{#snippet field(side: "start" | "end", calendarButton: Snippet)}
  {@const isStart = side === "start"}
  <div class="input-affix date-range__field">
    {@render calendarButton()}
    <!--
      Native date inputs are never `:placeholder-shown`; flag empty so the
      mm/dd/yyyy chrome renders in the placeholder colour.
    -->
    <input
      use:captureInput={side}
      type="date"
      class="field__control field__control--affix-start"
      data-empty={(isStart ? current.start : current.end) ? undefined : true}
      value={isStart ? current.start : current.end}
      oninput={(e) =>
        update(
          isStart
            ? { start: e.currentTarget.value, end: current.end }
            : { start: current.start, end: e.currentTarget.value },
        )}
      min={isStart ? min : current.start || min}
      max={isStart ? current.end || max : max}
      name={isStart ? startName : endName}
      {required}
      {disabled}
      aria-label={isStart ? startLabel : endLabel}
      aria-invalid={isInvalid || undefined}
    />
  </div>
{/snippet}

{#snippet startPickerButton()}
  {@render calendarIconButton(() => openDatePicker(startEl), `${startLabel} — choose date`)}
{/snippet}

{#snippet endPickerButton()}
  {@render calendarIconButton(() => openDatePicker(endEl), `${endLabel} — choose date`)}
{/snippet}

{#snippet startTrigger()}
  <!--
    Ark keeps aria-controls on the trigger at all times, but the popup it names
    is only mounted while open; popupControls drops it while closed.
  -->
  <ArkPopover.Trigger {...popupControls(open)}>
    {#snippet asChild(props)}
      <button
        {...props({
          type: "button",
          class: "input-affix__adornment input-affix__adornment--start input-affix__action",
          disabled,
          "aria-label": `${startLabel} — choose date`,
        })}
      >
        <Icon name="calendar" size={iconSize} />
      </button>
    {/snippet}
  </ArkPopover.Trigger>
{/snippet}

{#snippet endOpenButton()}
  {@render calendarIconButton(() => (open = true), `${endLabel} — choose date`)}
{/snippet}

{#snippet sep()}
  <span class="date-range__separator text-default-body-large" aria-hidden="true">
    {#if typeof separator === "string"}{separator}{:else}{@render separator()}{/if}
  </span>
{/snippet}

<div
  {id}
  role="group"
  aria-labelledby={label ? labelId : undefined}
  aria-describedby={describedBy}
  data-disabled={disabled || undefined}
  class={clsx(inputFieldStyles({ size }), "date-range", className)}
>
  {#if label}
    <span id={labelId} class="field__label">
      {label}
      {#if required}<span class="field__required" aria-hidden="true"></span>{/if}
    </span>
  {/if}

  {#if coarse()}
    <div class="date-range__row" bind:this={rowEl}>
      {@render field("start", startPickerButton)}
      {@render sep()}
      {@render field("end", endPickerButton)}
    </div>
  {:else}
    <ArkPopover.Root
      bind:open
      positioning={datePopoverPositioning(() => rowEl)}
      initialFocusEl={() => activeDayEl}
    >
      <div class="date-range__row" bind:this={rowEl}>
        {@render field("start", startTrigger)}
        {@render sep()}
        {@render field("end", endOpenButton)}
      </div>
      <DatePopover
        container={portalContainer}
        label={`${startLabel} — ${endLabel}, choose dates`}
      >
        <Calendar
          mode="range"
          numMonths={2}
          rangeValue={{
            start: parseISODate(current.start),
            end: parseISODate(current.end),
          }}
          min={parseISODate(min)}
          max={parseISODate(max)}
          onRangeChange={(r) =>
            update({
              start: r.start ? toISODate(r.start) : "",
              end: r.end ? toISODate(r.end) : "",
            })}
          onRangeComplete={() => (open = false)}
          onActiveDay={(el) => (activeDayEl = el)}
        />
      </DatePopover>
    </ArkPopover.Root>
  {/if}

  {#if helperText && !isInvalid}
    <p id={helperId} class="field__description">{helperText}</p>
  {/if}
  {#if isInvalid && errorMessage}
    <FieldError id={errorId} message={errorMessage} />
  {/if}
</div>
