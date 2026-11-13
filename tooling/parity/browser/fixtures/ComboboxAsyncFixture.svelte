<script lang="ts">
  import { onMount } from "svelte";
  import { Combobox } from "@ui-organized/svelte";
  import { OPTIONS_ARRIVE_AFTER } from "./comboboxAsync.js";

  // See comboboxAsync.ts.
  let { options = [], ...rest }: { options?: { value: string; label: string }[] } & Record<
    string,
    unknown
  > = $props();

  let loaded = $state<{ value: string; label: string }[]>([]);
  onMount(() => {
    const timer = setTimeout(() => (loaded = options), OPTIONS_ARRIVE_AFTER);
    return () => clearTimeout(timer);
  });
</script>

<Combobox {...rest} options={loaded} />
