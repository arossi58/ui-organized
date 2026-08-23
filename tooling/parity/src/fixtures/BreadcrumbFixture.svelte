<script lang="ts">
  import { Breadcrumb } from "@ui-organized/svelte";

  // `separator` needs no translation: Svelte takes it as `string | Snippet`, so
  // the case's string reaches the component as written.
  let { ...props }: Record<string, any> = $props();
</script>

<Breadcrumb {...props} />
