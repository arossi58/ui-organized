<script lang="ts">
  import { Icon, IconProvider } from "@ui-organized/svelte";
  import { SVELTE_STUB_SET } from "./svelteIcons.js";
  import StubIcon from "./StubIcon.svelte";

  // `supplied` swaps the canonical name for a component handed over directly,
  // which is a separate branch in every `Icon`: no registry lookup, no adapter,
  // and core's own `{ size, strokeWidth }` fallback instead of the set's
  // `svgProps`. The component itself has to come from the fixture, because each
  // framework's is its own.
  let { provider, supplied = false, name, ...rest }: Record<string, any> = $props();
  const resolved = $derived(supplied ? StubIcon : name);
</script>

<!-- The wrapper is load-bearing for one case; see the Icon spec in cases/Icon.tsx. -->
<div class="icon-probe">
  {#if provider}
    <IconProvider
      library="lucide"
      style="outline"
      strokeAdjustment={false}
      icons={SVELTE_STUB_SET}
      {...provider}
    >
      <Icon name={resolved} {...rest} />
    </IconProvider>
  {:else}
    <Icon name={resolved} {...rest} />
  {/if}
</div>
