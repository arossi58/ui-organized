<!--
  Calendar-driven date field, backed by Ark's DatePicker machine.

  The public API is ISO date strings; the machine works in `DateValue` objects,
  and the conversion happens at this boundary so nothing downstream has to know
  about `@internationalized/date`.
-->
<script lang="ts">
  import { DatePicker as ArkDatePicker, Portal, parseDate } from "@ark-ui/svelte";
  import { clsx } from "clsx";
  import { CONTROL_ICON_SIZE, datePickerStyles } from "@ui-organized/core";
  import Icon from "../Icon/Icon.svelte";
  import FieldError from "../FieldError/FieldError.svelte";
  import type { DatePickerProps } from "./DatePicker.types.js";
  import "@ui-organized/core/components/DatePicker/DatePicker.css";

  /** Weekday header and navigation glyphs stay one step below the cell text. */
  const NAV_ICON_SIZE = 16;

  let {
    label,
    helperText,
    error,
    value = $bindable(),
    defaultValue,
    onValueChange,
    selectionMode,
    min,
    max,
    numOfMonths,
    locale,
    open = $bindable(),
    defaultOpen,
    onOpenChange,
    size = "md",
    variant,
    required,
    disabled,
    readOnly,
    name,
    portalContainer,
    class: className,
  }: DatePickerProps = $props();

  const isInvalid = $derived(!!error);
  const errorMessage = $derived(typeof error === "string" ? error : undefined);
  const iconSize = $derived(CONTROL_ICON_SIZE[size]);

  /** ISO dates in, parsed calendar dates out. */
  const parsedValue = $derived(value ? value.map((d) => parseDate(d)) : undefined);
  const parsedDefault = $derived(defaultValue ? defaultValue.map((d) => parseDate(d)) : undefined);
  const parsedMin = $derived(min ? parseDate(min) : undefined);
  const parsedMax = $derived(max ? parseDate(max) : undefined);
</script>

<ArkDatePicker.Root
  class={clsx(datePickerStyles({ size, variant }), className)}
  value={parsedValue}
  defaultValue={parsedDefault}
  onValueChange={(details) => {
    value = details.value.map(String);
    onValueChange?.(value);
  }}
  {selectionMode}
  min={parsedMin}
  max={parsedMax}
  {numOfMonths}
  {locale}
  bind:open
  {defaultOpen}
  onOpenChange={(details) => onOpenChange?.(details.open)}
  invalid={isInvalid}
  {required}
  {disabled}
  {readOnly}
  {name}
  positioning={{ placement: "bottom-start", gutter: 4 }}
>
  {#if label}
    <ArkDatePicker.Label class="field__label">
      {label}
      {#if required}<span class="field__required" aria-hidden="true"></span>{/if}
    </ArkDatePicker.Label>
  {/if}

  <ArkDatePicker.Control class="date-picker__control">
    <ArkDatePicker.Input class="date-picker__input" index={0} />
    {#if selectionMode === "range"}
      <ArkDatePicker.Input class="date-picker__input" index={1} />
    {/if}
    <ArkDatePicker.Trigger class="date-picker__trigger">
      <Icon name="calendar" size={iconSize} />
    </ArkDatePicker.Trigger>
  </ArkDatePicker.Control>

  <Portal container={portalContainer ?? undefined}>
    <!--
      The positioner class must stay a plain string literal — the
      overlay-stacking test scans for it, and a clsx() call here silently
      unregisters the layer.
    -->
    <ArkDatePicker.Positioner class="date-picker__positioner">
      <ArkDatePicker.Content class="date-picker__popup">
        <ArkDatePicker.View view="day">
          <ArkDatePicker.Context>
            {#snippet render(api)}
              <ArkDatePicker.ViewControl class="date-picker__view-control">
                <ArkDatePicker.PrevTrigger class="date-picker__nav">
                  <Icon name="chevron-left" size={NAV_ICON_SIZE} />
                </ArkDatePicker.PrevTrigger>
                <ArkDatePicker.ViewTrigger class="date-picker__view-trigger">
                  <ArkDatePicker.RangeText />
                </ArkDatePicker.ViewTrigger>
                <ArkDatePicker.NextTrigger class="date-picker__nav">
                  <Icon name="chevron-right" size={NAV_ICON_SIZE} />
                </ArkDatePicker.NextTrigger>
              </ArkDatePicker.ViewControl>

              <ArkDatePicker.Table class="date-picker__table">
                <ArkDatePicker.TableHead>
                  <ArkDatePicker.TableRow>
                    {#each api().weekDays as day (day.long)}
                      <ArkDatePicker.TableHeader
                        class="date-picker__weekday"
                        aria-label={day.long}
                      >
                        {day.narrow}
                      </ArkDatePicker.TableHeader>
                    {/each}
                  </ArkDatePicker.TableRow>
                </ArkDatePicker.TableHead>
                <ArkDatePicker.TableBody>
                  {#each api().weeks as week, weekIndex (weekIndex)}
                    <ArkDatePicker.TableRow>
                      {#each week as day, dayIndex (dayIndex)}
                        <ArkDatePicker.TableCell value={day} class="date-picker__cell">
                          <ArkDatePicker.TableCellTrigger class="date-picker__day">
                            {day.day}
                          </ArkDatePicker.TableCellTrigger>
                        </ArkDatePicker.TableCell>
                      {/each}
                    </ArkDatePicker.TableRow>
                  {/each}
                </ArkDatePicker.TableBody>
              </ArkDatePicker.Table>
            {/snippet}
          </ArkDatePicker.Context>
        </ArkDatePicker.View>
      </ArkDatePicker.Content>
    </ArkDatePicker.Positioner>
  </Portal>

  {#if helperText && !isInvalid}
    <span class="field__description">{helperText}</span>
  {/if}
  {#if isInvalid && errorMessage}
    <FieldError message={errorMessage} />
  {/if}
</ArkDatePicker.Root>
