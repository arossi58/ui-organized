<script lang="ts">
  import { Chip } from "@ui-organized/svelte";

  /**
   * `removable` is translated, exactly as the React builder in `cases/Chip.tsx`
   * translates it. Each library spells the dismiss control in its own idiom —
   * React takes `onRemove`, Svelte takes `onremove`, Vue and Angular take a
   * `removable` boolean and emit — so the harness carries the *intent* across
   * and compares the markup, which is the thing that has to agree.
   */
  let { removable, ...props }: Record<string, unknown> = $props();
</script>

<Chip {...props} onremove={removable ? () => {} : undefined}>Admin</Chip>
