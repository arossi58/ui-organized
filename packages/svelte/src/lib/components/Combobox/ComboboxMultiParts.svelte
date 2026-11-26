<!--
  The multiple-mode text box and hidden values. Backspace in an empty box
  removes the last value; each value is submitted as its own hidden input,
  because the text box holds the query. React's MultiInput and HiddenValues.
-->
<script lang="ts">
  import { Combobox as ArkCombobox, Field, useComboboxContext } from "@ark-ui/svelte";

  let { placeholder, part, name }: { placeholder?: string; part: "input" | "values"; name?: string } = $props();
  const combobox = useComboboxContext();
</script>

{#if part === "input"}
  <!-- See Combobox.svelte on why aria-describedby is passed in by hand. -->
  <Field.Context>
    {#snippet render(field)}
      <ArkCombobox.Input
        class="field__control combobox-field__input"
        placeholder={combobox().value.length ? undefined : placeholder}
        aria-describedby={field()?.ariaDescribedby}
        onkeydown={(event) => {
          if (event.key !== "Backspace" || combobox().inputValue !== "") return;
          const values = combobox().value;
          const last = values[values.length - 1];
          if (last != null) combobox().clearValue(last);
        }}
      />
    {/snippet}
  </Field.Context>
{:else if name}
  {#each combobox().value as v (v)}
    <input type="hidden" {name} value={v} />
  {/each}
{/if}
