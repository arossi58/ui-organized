<script lang="ts">
  import { QrCode as ArkQrCode } from "@ark-ui/svelte";
  import { clsx } from "clsx";
  import { qrCodeStyles } from "@ui-organized/core";
  import Button from "../Button/Button.svelte";
  import type { QRCodeProps } from "./QRCode.types.js";
  import "@ui-organized/core/components/QRCode/QRCode.css";

  const DEFAULT_PIXEL_SIZE = 10;

  /**
   * A scannable code for a string.
   *
   * Exported as `QRCode`; Ark's namespace is `QrCode`. The library's casing wins
   * for the public name — the initialism is capitalised everywhere else here.
   *
   * The encoder is the machine's: `@zag-js/qr-code` bundles `uqr` and publishes
   * the finished module grid as the pattern's `d`. Nothing here computes a
   * single module, which is the point — three libraries hand-rolling an encoder
   * would produce three codes.
   */
  let {
    value,
    label,
    pixelSize = DEFAULT_PIXEL_SIZE,
    errorCorrection,
    overlay,
    showDownload = false,
    downloadLabel = "Download",
    downloadFileName = "qr-code",
    size = "md",
    variant,
    class: className,
  }: QRCodeProps = $props();
</script>

<ArkQrCode.Root
  class={clsx(qrCodeStyles({ size, variant }), className)}
  {value}
  {pixelSize}
  encoding={errorCorrection ? { ecc: errorCorrection } : undefined}
  aria-label={label ?? value}
>
  <ArkQrCode.Frame class="qr-code__frame">
    <ArkQrCode.Pattern class="qr-code__pattern" />
  </ArkQrCode.Frame>
  {#if overlay}
    <ArkQrCode.Overlay class="qr-code__overlay">{@render overlay()}</ArkQrCode.Overlay>
  {/if}
  <!--
    The download control *is* the library Button, projected through Ark's asChild
    so it inherits every interactive token instead of restating them. `class` is
    pulled out and handed over separately because Ark types the projected props
    in Svelte's own shapes, where it is a `ClassValue` that may be null while the
    Button takes a string.
  -->
  {#if showDownload}
    <ArkQrCode.DownloadTrigger mimeType="image/png" fileName={`${downloadFileName}.png`}>
      {#snippet asChild(props)}
        {@const { class: arkClass, ...triggerProps } = props()}
        <Button
          intent="secondary"
          {size}
          type="button"
          icon="download"
          class={clsx(arkClass)}
          {...triggerProps}
        >
          {downloadLabel}
        </Button>
      {/snippet}
    </ArkQrCode.DownloadTrigger>
  {/if}
</ArkQrCode.Root>
