<script lang="ts">
  import { Timer as ArkTimer } from "@ark-ui/svelte";
  import { clsx } from "clsx";
  import { timerStyles } from "@ui-organized/core";
  import Button from "../Button/Button.svelte";
  import type { TimerPart, TimerProps } from "./Timer.types.js";
  import "@ui-organized/core/components/Timer/Timer.css";
  import { glyph } from "../../icons/glyph.js";

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
        inherit every interactive token instead of restating them.
      -->
      <ArkTimer.ActionTrigger action="start">
        {#snippet asChild(props)}
          <Button intent="primary" {size} icon={glyph("play")} type="button" {...withoutAction(props())}>
            Start
          </Button>
        {/snippet}
      </ArkTimer.ActionTrigger>
      <ArkTimer.ActionTrigger action="pause">
        {#snippet asChild(props)}
          <Button intent="secondary" {size} icon={glyph("pause")} type="button" {...withoutAction(props())}>
            Pause
          </Button>
        {/snippet}
      </ArkTimer.ActionTrigger>
      <ArkTimer.ActionTrigger action="resume">
        {#snippet asChild(props)}
          <Button intent="secondary" {size} icon={glyph("play")} type="button" {...withoutAction(props())}>
            Resume
          </Button>
        {/snippet}
      </ArkTimer.ActionTrigger>
      <ArkTimer.ActionTrigger action="reset">
        {#snippet asChild(props)}
          <Button intent="ghost" {size} icon={glyph("refresh")} type="button" {...withoutAction(props())}>
            Reset
          </Button>
        {/snippet}
      </ArkTimer.ActionTrigger>
    </ArkTimer.Control>
  {/if}
</ArkTimer.Root>
