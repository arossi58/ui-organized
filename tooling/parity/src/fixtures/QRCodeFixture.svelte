<script lang="ts">
  import { QRCode } from "@ui-organized/svelte";

  // `overlay` arrives as a boolean — see the note in cases/QRCode.tsx. React
  // takes a node and Vue a slot; here it is a snippet, and the flag chooses
  // between handing it over and leaving the prop unset.
  let { overlay: withOverlay = false, ...props }: Record<string, any> = $props();
</script>

{#snippet overlayContent()}<span class="qr-overlay-probe">logo</span>{/snippet}

<QRCode {...props} overlay={withOverlay ? overlayContent : undefined} />
