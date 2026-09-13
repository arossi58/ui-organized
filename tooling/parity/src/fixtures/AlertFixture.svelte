<script lang="ts">
  import { Alert } from "@ui-organized/svelte";

  // `onDismiss` arrives as a boolean — see the note in cases/Alert.tsx. Svelte
  // keys the dismiss button off the presence of a callback exactly as React
  // does, so the fixture supplies one rather than translating to a different
  // prop.
  let { children, onDismiss, ...props }: Record<string, any> = $props();
</script>

<Alert {...props} onDismiss={onDismiss ? () => {} : undefined}>
  {children ?? "Something happened"}
</Alert>
