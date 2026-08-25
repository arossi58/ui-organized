<script setup lang="ts">
import { computed, useAttrs } from "vue";
import { SignaturePad as ArkSignaturePad } from "@ark-ui/vue";
import { clsx } from "clsx";
import { signaturePadStyles } from "@ui-organized/core";
import { definedOnly } from "../../props.js";
import Button from "../Button/Button.vue";
import FieldError from "../FieldError/FieldError.vue";
import type { SignaturePadProps } from "./SignaturePad.types.js";
import "@ui-organized/core/components/SignaturePad/SignaturePad.css";

const DEFAULT_STROKE_WIDTH = 2;

defineOptions({ inheritAttrs: false });
// Every boolean here declares a default, and the three forwarded to Ark declare
// `undefined`. Vue casts an absent Boolean prop to `false`, and `definedOnly`
// then forwards that as a deliberate choice; `showGuide` and `showClear` are not
// forwarded but default to *true*, which the same cast would silently turn off.
// See ../../props.ts.
const props = withDefaults(defineProps<SignaturePadProps>(), {
  strokeWidth: DEFAULT_STROKE_WIDTH,
  showGuide: true,
  showClear: true,
  clearLabel: "Clear",
  size: "md",
  required: undefined,
  disabled: undefined,
  readOnly: undefined,
});
const emit = defineEmits<{
  "update:paths": [paths: string[]];
  draw: [paths: string[]];
  /**
   * `getDataUrl` rasterises the signature — reach for it when a server wants a
   * PNG rather than the stroke paths the hidden input submits.
   */
  drawEnd: [
    paths: string[],
    getDataUrl: (
      type: "image/png" | "image/jpeg" | "image/svg+xml",
      quality?: number,
    ) => Promise<string>,
  ];
}>();

const attrs = useAttrs();

const isInvalid = computed(() => !!props.error);
const errorMessage = computed(() => (typeof props.error === "string" ? props.error : undefined));
const rootClass = computed(() =>
  clsx(
    signaturePadStyles({ size: props.size, variant: props.variant }),
    attrs.class as string,
  ),
);

const rootProps = computed(() =>
  definedOnly({
    paths: props.paths,
    defaultPaths: props.defaultPaths,
    required: props.required,
    disabled: props.disabled,
    readOnly: props.readOnly,
    name: props.name,
  }),
);

/* The ink is a canvas stroke in device pixels, so its width is a prop rather
   than CSS. Its colour is themed — see SignaturePad.css. */
const drawing = computed(() => ({ size: props.strokeWidth }));

// Written here rather than inline: a Vue template expression cannot carry an
// object type annotation, and the handlers' details argument needs one.
function onDraw(details: { paths: string[] }) {
  emit("update:paths", details.paths);
  emit("draw", details.paths);
}
function onDrawEnd(details: {
  paths: string[];
  getDataUrl: (
    type: "image/png" | "image/jpeg" | "image/svg+xml",
    quality?: number,
  ) => Promise<string>;
}) {
  emit("drawEnd", details.paths, details.getDataUrl);
}
</script>

<template>
  <ArkSignaturePad.Root
    :class="rootClass"
    :drawing="drawing"
    v-bind="rootProps"
    @draw="onDraw"
    @draw-end="onDrawEnd"
  >
    <ArkSignaturePad.Label v-if="label" class="field__label">
      {{ label }}
      <span v-if="required" class="field__required" aria-hidden="true" />
    </ArkSignaturePad.Label>

    <ArkSignaturePad.Control class="signature-pad__control">
      <!--
        Ark's `Segment` renders the whole signature: it maps the machine's
        `paths` itself and appends the in-progress `currentPath`. So it is
        rendered ONCE.

        It used to be mapped over `api.paths`, which produced one `<svg>` per
        stroke, each drawing every stroke — N copies stacked exactly on top of
        one another — and the `path` prop Ark does not read was spread onto the
        `<svg>` as a stray attribute. It looked right, because the topmost copy
        is the correct one.
      -->
      <ArkSignaturePad.Segment class="signature-pad__segment" />
      <ArkSignaturePad.Guide v-if="showGuide" class="signature-pad__guide" />
    </ArkSignaturePad.Control>

    <!--
      The clear control *is* the library Button, projected through Ark's
      `as-child` so it inherits every interactive token instead of restating
      them. zag hides the trigger until there is something to clear, and that
      `hidden` rides across with the rest of the projected props.
    -->
    <ArkSignaturePad.ClearTrigger v-if="showClear" as-child>
      <Button intent="ghost" :size="size" type="button" icon="refresh">
        {{ clearLabel }}
      </Button>
    </ArkSignaturePad.ClearTrigger>

    <span v-if="helperText && !isInvalid" class="field__description">{{ helperText }}</span>
    <FieldError v-if="isInvalid && errorMessage" :message="errorMessage" />
    <!--
      The hidden input requires an explicit value, and the machine offers two
      forms: the stroke paths, and a rasterised data URL from `getDataUrl` —
      which is async and so cannot feed a render-time prop. The paths are
      submitted instead: they are lossless, resolution independent, and
      deterministic. Reach for the PNG via `@draw-end`, whose second argument is
      `getDataUrl`, when a raster is what the server wants.
    -->
    <ArkSignaturePad.Context v-slot="api">
      <ArkSignaturePad.HiddenInput :value="api.paths.join(' ')" />
    </ArkSignaturePad.Context>
  </ArkSignaturePad.Root>
</template>
