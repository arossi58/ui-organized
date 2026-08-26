<script lang="ts">
  import { AngleSlider } from "@ui-organized/svelte";
  let { ...props }: Record<string, any> = $props();
</script>

<AngleSlider {...props} />
