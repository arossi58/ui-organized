<script lang="ts">
  import { Steps as ArkSteps } from "@ark-ui/svelte";
  import { clsx } from "clsx";
  import { stepsStyles, OMIT_ARIA } from "@ui-organized/core";
  import Button from "../Button/Button.svelte";
  import Icon from "../Icon/Icon.svelte";
  import type { StepsProps } from "./Steps.types.js";
  import "@ui-organized/core/components/Steps/Steps.css";

  /** The completed tick sits inside the indicator circle at every size — it marks
   *  the step rather than scaling with the surrounding text. */
  const COMPLETE_ICON_SIZE = 16;

  let {
    steps,
    step = $bindable(),
    defaultStep,
    onStepChange,
    onStepComplete,
    orientation = "horizontal",
    size = "md",
    variant = "numbered",
    linear,
    showContent = true,
    completedContent,
    class: className,
  }: StepsProps = $props();
</script>

<!--
  `count` is derived, never a prop: a count out of step with `steps` would desync
  the progress bar and the trigger list against each other.
-->
<ArkSteps.Root
  class={clsx(stepsStyles({ orientation, size, variant }), className)}
  count={steps.length}
  bind:step
  {defaultStep}
  onStepChange={onStepChange && ((details) => onStepChange(details.step))}
  {onStepComplete}
  {orientation}
  {linear}
>
  <!--
    The list is pinned to a <div> with asChild: `@ark-ui/svelte` builds this part
    on `ark.ol` while `@ark-ui/react` and `@ark-ui/vue` both build it on
    `ark.div`, and one stylesheet styles every framework library. An <ol> here
    brings UA list styling and its own box with it, against rules written for a
    plain one. The caller's class goes *through* Ark's props function rather
    than being spread after it, so Ark's own attributes survive the merge.
  -->
  <ArkSteps.List>
    {#snippet asChild(listProps)}
      <div {...listProps({ class: "steps__list" })}>
        {#each steps as item, index (item.title)}
          <!--
            A `tablist` may own only tabs, and each Item is a direct child div
            that is neither. Ark already marks it `role="presentation"`, but
            presentation is *ignored* on an element carrying a global ARIA
            attribute — and Ark also sets `aria-current` here. Dropping
            `aria-current` lets the presentation role hold; nothing is lost,
            because the trigger inside already reports `aria-selected`. Same fix,
            and same sentinel, as the React library.
          -->
          <ArkSteps.Item {index} class="steps__item" role="presentation" aria-current={OMIT_ARIA}>
            <!--
              Ark names a panel on every trigger, but the panels only exist when
              `showContent` is on. Left in place the reference dangles, which is
              an ARIA error and costs the trigger its accessible name.
            -->
            <ArkSteps.Trigger
              class="steps__trigger"
              {...showContent ? {} : { "aria-controls": OMIT_ARIA }}
            >
              <ArkSteps.Indicator class="steps__indicator">
                <!--
                  The tick replaces the number only once the step is complete;
                  CSS hides whichever one does not apply.
                -->
                <span class="steps__indicator-number">
                  {#if variant === "numbered"}{index + 1}{/if}
                </span>
                <Icon name="check" size={COMPLETE_ICON_SIZE} class="steps__indicator-check" />
              </ArkSteps.Indicator>
              <span class="steps__text">
                <span class="steps__title">{item.title}</span>
                {#if item.description}
                  <span class="steps__description">{item.description}</span>
                {/if}
              </span>
            </ArkSteps.Trigger>
            <ArkSteps.Separator class="steps__separator" />
          </ArkSteps.Item>
        {/each}
      </div>
    {/snippet}
  </ArkSteps.List>

  {#if showContent}
    {#each steps as item, index (item.title)}
      <ArkSteps.Content {index} class="steps__content">
        {#if typeof item.content === "string"}{item.content}{:else}{@render item.content?.()}{/if}
      </ArkSteps.Content>
    {/each}
    <ArkSteps.CompletedContent class="steps__content">
      {#if typeof completedContent === "string"}
        {completedContent}
      {:else}
        {@render completedContent?.()}
      {/if}
    </ArkSteps.CompletedContent>
    <div class="steps__actions">
      <!--
        The two actions *are* the library Button, projected through Ark's asChild
        so they inherit every interactive token instead of restating them.
        `class` is pulled out and handed over separately because Ark types the
        projected props in Svelte's own shapes, where it is a `ClassValue` that
        may be null while the Button takes a string.
      -->
      <ArkSteps.PrevTrigger>
        {#snippet asChild(props)}
          {@const { class: arkClass, ...triggerProps } = props()}
          <Button intent="secondary" {size} type="button" class={clsx(arkClass)} {...triggerProps}>
            Back
          </Button>
        {/snippet}
      </ArkSteps.PrevTrigger>
      <ArkSteps.NextTrigger>
        {#snippet asChild(props)}
          {@const { class: arkClass, ...triggerProps } = props()}
          <Button intent="primary" {size} type="button" class={clsx(arkClass)} {...triggerProps}>
            Next
          </Button>
        {/snippet}
      </ArkSteps.NextTrigger>
    </div>
  {/if}
</ArkSteps.Root>
