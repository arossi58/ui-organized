<script lang="ts">
  import { Button, Input } from "@ui-organized/svelte";
  // `withButton` stands for the slot add-on; see cases/Input.tsx.
  let { withButton = false, ...props }: Record<string, any> = $props();
</script>

{#snippet copy()}<Button intent="secondary">Copy</Button>{/snippet}

<Input {...props} endAddon={withButton ? copy : props.endAddon} />
