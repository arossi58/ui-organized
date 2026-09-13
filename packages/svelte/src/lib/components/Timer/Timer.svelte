<script lang="ts">
  import { Timer as ArkTimer } from "@ark-ui/svelte";
  import { clsx } from "clsx";
  import { timerStyles } from "@ui-organized/core";
  import Button from "../Button/Button.svelte";
  import type { TimerPart, TimerProps } from "./Timer.types.js";
  import "@ui-organized/core/components/Timer/Timer.css";

  const DEFAULT_PARTS: TimerPart[] = ["hours", "minutes", "seconds"];

  let {
    parts = DEFAULT_PARTS,
    countdown,
    startMs,
    targetMs,
    autoStart,
    interval,
    onComplete,
    showControls = false,
    size = "md",
    variant,
    showLabels = false,
    class: className,
  }: TimerProps = $props();

  /**
   * Drops `action` from the projected trigger props.
   *
   * `action` is a machine prop, not an attribute. `@ark-ui/react` splits it off
   * with `createSplitProps` and `@ark-ui/vue` declares it as a prop, so neither
   * puts it on the DOM; `@ark-ui/svelte` merges the whole props object back onto
   * the element and would render `action="start"` on a <button>, which is not a
   * valid attribute there. Stripping it keeps the four libraries emitting the
   * same button.
   */
  function withoutAction<T extends object>(props: T): Omit<T, "action"> {
    const { ...rest } = props;
    delete (rest as Record<string, unknown>).action;
    return rest;
  }
</script>

<ArkTimer.Root
  class={clsx(timerStyles({ size, variant }), className)}
  {countdown}
  {startMs}
  {targetMs}
  {autoStart}
  {interval}
  {onComplete}
>
  <ArkTimer.Area class="timer__area">
    {#each parts as part, index (part)}
      {#if index > 0}
        <ArkTimer.Separator class="timer__separator" aria-hidden="true">:</ArkTimer.Separator>
      {/if}
      <div class="timer__segment">
        <ArkTimer.Item type={part} class="timer__value" />
        {#if showLabels}<span class="timer__label">{part}</span>{/if}
      </div>
    {/each}
  </ArkTimer.Area>

  {#if showControls}
    <ArkTimer.Control class="timer__control">
      <!--
        zag hides whichever trigger does not apply to the current state, so
        start and resume can both be present without a conditional here.

        Each is the library Button projected through Ark's asChild, so they
        inherit every interactive token instead of restating them. `class` is
        pulled out and handed over separately because Ark types the projected
        props in Svelte's own shapes, where it is a `ClassValue` that may be
        null while the Button takes a string.
      -->
      <ArkTimer.ActionTrigger action="start">
        {#snippet asChild(props)}
          {@const { class: arkClass, ...triggerProps } = withoutAction(props())}
          <Button intent="primary" {size} icon="play" type="button" class={clsx(arkClass)} {...triggerProps}>
            Start
          </Button>
        {/snippet}
      </ArkTimer.ActionTrigger>
      <ArkTimer.ActionTrigger action="pause">
        {#snippet asChild(props)}
          {@const { class: arkClass, ...triggerProps } = withoutAction(props())}
          <Button intent="secondary" {size} icon="pause" type="button" class={clsx(arkClass)} {...triggerProps}>
            Pause
          </Button>
        {/snippet}
      </ArkTimer.ActionTrigger>
      <ArkTimer.ActionTrigger action="resume">
        {#snippet asChild(props)}
          {@const { class: arkClass, ...triggerProps } = withoutAction(props())}
          <Button intent="secondary" {size} icon="play" type="button" class={clsx(arkClass)} {...triggerProps}>
            Resume
          </Button>
        {/snippet}
      </ArkTimer.ActionTrigger>
      <ArkTimer.ActionTrigger action="reset">
        {#snippet asChild(props)}
          {@const { class: arkClass, ...triggerProps } = withoutAction(props())}
          <Button intent="ghost" {size} icon="refresh" type="button" class={clsx(arkClass)} {...triggerProps}>
            Reset
          </Button>
        {/snippet}
      </ArkTimer.ActionTrigger>
    </ArkTimer.Control>
  {/if}
</ArkTimer.Root>
