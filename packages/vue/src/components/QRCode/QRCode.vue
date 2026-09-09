<!--
  A scannable code for a string.

  Exported as `QRCode`; Ark's namespace is `QrCode`. The library's casing wins
  for the public name — the initialism is capitalised everywhere else here.

  The encoder is the machine's: `@zag-js/qr-code` bundles `uqr` and publishes the
  finished module grid as the pattern's `d`. Nothing here computes a single
  module, which is the point — three libraries hand-rolling an encoder would
  produce three codes.

  The overlay is a named slot rather than a prop, because a Vue component cannot
  take markup as a prop. React takes a `ReactNode` and Svelte a `Snippet`; all
  three render the same `qr-code__overlay` element around it.
-->
<script setup lang="ts">
import { computed, useAttrs, useSlots } from "vue";
import { QrCode as ArkQrCode } from "@ark-ui/vue";
import { clsx } from "clsx";
import { qrCodeStyles } from "@ui-organized/core";
import { definedOnly } from "../../props.js";
import Button from "../Button/Button.vue";
import type { QRCodeProps } from "./QRCode.types.js";
import "@ui-organized/core/components/QRCode/QRCode.css";

const DEFAULT_PIXEL_SIZE = 10;

defineOptions({ inheritAttrs: false });
// `showDownload` is not forwarded to Ark, so a Vue Boolean cast to `false` is
// the same answer this default gives. Nothing here forwards a boolean whose
// machine default is `true`, which is the case that bites — see ../../props.ts.
const props = withDefaults(defineProps<QRCodeProps>(), {
  pixelSize: DEFAULT_PIXEL_SIZE,
  showDownload: false,
  downloadLabel: "Download",
  downloadFileName: "qr-code",
  size: "md",
});

const attrs = useAttrs();
const slots = useSlots();

const rootClass = computed(() =>
  clsx(qrCodeStyles({ size: props.size, variant: props.variant }), attrs.class as string),
);

/**
 * Ark Vue calls the encoded string `modelValue`, not `value`.
 *
 * Its single-value controlled props are named for `v-model`, so `:value="…"`
 * would be an unknown attribute and the machine would encode its own default —
 * a code that scans to the wrong string with no error anywhere. React and Svelte
 * both take `value`; the facade keeps `value` and translates here.
 */
const rootProps = computed(() =>
  definedOnly({
    modelValue: props.value,
    pixelSize: props.pixelSize,
    encoding: props.errorCorrection ? { ecc: props.errorCorrection } : undefined,
  }),
);

const hasOverlay = computed(() => Boolean(slots.overlay));
</script>

<template>
  <ArkQrCode.Root :class="rootClass" v-bind="rootProps">
    <!-- The name lives on the Frame, not the Root. `aria-label` on a div with no
         role is prohibited — ARIA ignores it, so the code is announced as nothing
         at all — and `role="img"` is what makes it legal. But it has to go on the
         element that *is* the image: the Root also holds the download button, and
         an `img` may not contain a control. The Frame is the code itself and owns
         neither problem. Same reasoning as the React library. -->
    <ArkQrCode.Frame class="qr-code__frame" role="img" :aria-label="label ?? value">
      <ArkQrCode.Pattern class="qr-code__pattern" />
    </ArkQrCode.Frame>
    <ArkQrCode.Overlay v-if="hasOverlay" class="qr-code__overlay">
      <slot name="overlay" />
    </ArkQrCode.Overlay>
    <!--
      The download control *is* the library Button, projected through Ark's
      `as-child` so it inherits every interactive token instead of restating
      them.
    -->
    <ArkQrCode.DownloadTrigger
      v-if="showDownload"
      mime-type="image/png"
      :file-name="`${downloadFileName}.png`"
      as-child
    >
      <Button intent="secondary" :size="size" type="button" icon="download">
        {{ downloadLabel }}
      </Button>
    </ArkQrCode.DownloadTrigger>
  </ArkQrCode.Root>
</template>
