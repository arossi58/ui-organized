<!--
  Deliberately writes `style`, the spelling Vue cannot deliver.

  It has to be a real template rather than an `h()` call, because the mangling
  this pins happens in the *compiler*: a static `style="solid"` is parsed into a
  style object long before props are resolved. A render function passes the
  string through untouched, so it would prove nothing.
-->
<script setup lang="ts">
import { h } from "vue";
import IconProvider from "./IconProvider.vue";
import { useIconConfig } from "./iconContext.js";

/** Reports whatever the provider actually resolved, so the test can see it. */
const Probe = () => h("span", { "data-icon-style": JSON.stringify(useIconConfig().value.style) });
</script>

<template>
  <IconProvider library="lucide" style="solid">
    <Probe />
  </IconProvider>
</template>
