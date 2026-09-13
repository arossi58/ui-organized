<!--
  The angle readout, written out rather than projected through
  `AngleSlider.ValueText`.

  Two things differ from Ark React, and writing the element by hand settles
  both.

  The element: `@ark-ui/vue` renders a <span> where `@ark-ui/react` renders a
  <div>, and inline vs block moves the readout inside a header both libraries
  lay out with one shared stylesheet.

  The attributes: `@ark-ui/react@5.37` never calls `getValueTextProps()` — it
  renders the caller's props and the degree text and nothing else — so its
  readout carries no `id`, `data-scope` or `data-part` at all. This is the
  wrapper, not the machine: both zag versions expose the getter, and
  `@ark-ui/vue` does call it. Rendering the part would therefore give this
  library three attributes React's has none of, and an extra `id` shifts every
  later element's placeholder in the parity gate. Vue's `as-child` is no escape
  either: it merges Ark's props onto whatever it wraps rather than offering them
  for inspection, so there is nothing to drop.

  Split into its own file because the value has to be read from the machine, and
  the context only exists below `AngleSlider.Root` — the same reason
  `MenuSeparator` and `SelectTrigger` are their own components.

  When Ark React starts calling the getter, render `AngleSlider.ValueText` here
  instead. The parity gate goes red at that point, which is how you will find
  out.
-->
<script setup lang="ts">
import { computed } from "vue";
import { useAngleSliderContext } from "@ark-ui/vue";

const angleSlider = useAngleSliderContext();

// Ark's default text is the CSS angle (`135deg`). This is the readout typeset
// as a degree instead, which is what supplying children overrides it with in
// the other libraries.
const text = computed(() => `${angleSlider.value.value}°`);
</script>

<template>
  <div class="angle-slider__value">{{ text }}</div>
</template>
