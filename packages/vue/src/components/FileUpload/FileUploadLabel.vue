<!--
  The label, taken from the machine directly so `data-invalid` can be dropped.

  zag 1.43 — the machine `@ark-ui/vue` bundles — stamps `data-invalid` on the
  label part; zag 1.41, the one `@ark-ui/react` bundles, does not. Note which
  way round that is: this is the machine leading rather than this library
  lagging, so the attribute will arrive for the other libraries too.

  It comes off anyway, because one stylesheet styles every framework library and
  `FileUpload.css` already selects on `[data-invalid]`. A label that carries the
  attribute in one library and not the others is how a rule ends up applying to
  one of three. Delete this component once Ark React ships the newer machine —
  the parity gate reddens at that point and says so.

  Ark's `as-child` cannot do this: it merges the part's props onto whatever it
  wraps rather than offering them for inspection, so there is nothing to drop.
  Reading `getLabelProps()` from context and writing the <label> out is the same
  move `MenuSeparator` makes for the same reason.
-->
<script setup lang="ts">
import { computed } from "vue";
import { useFileUploadContext } from "@ark-ui/vue";

const fileUpload = useFileUploadContext();

const labelProps = computed(() => {
  const rest: Record<string, unknown> = { ...fileUpload.value.getLabelProps() };
  delete rest["data-invalid"];
  return rest;
});
</script>

<template>
  <label v-bind="labelProps" class="field__label"><slot /></label>
</template>
