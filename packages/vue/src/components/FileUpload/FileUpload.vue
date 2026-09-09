<script setup lang="ts">
import { computed, useAttrs } from "vue";
import { FileUpload as ArkFileUpload } from "@ark-ui/vue";
import { clsx } from "clsx";
import { CONTROL_ICON_SIZE, fileUploadStyles, OMIT_ARIA } from "@ui-organized/core";
import { definedOnly } from "../../props.js";
import Icon from "../Icon/Icon.vue";
import FieldError from "../FieldError/FieldError.vue";
import FileUploadLabel from "./FileUploadLabel.vue";
import FileUploadTrigger from "./FileUploadTrigger.vue";
import type { FileUploadProps } from "./FileUpload.types.js";
import "@ui-organized/core/components/FileUpload/FileUpload.css";

/** Delete affordance inside a file row — always the small edge, because it sits
 *  inside the row rather than beside it. */
const DELETE_ICON_SIZE = 16;

defineOptions({ inheritAttrs: false });
// Every boolean forwarded to Ark below must default to `undefined`. Vue casts
// an absent Boolean prop to `false`, and `definedOnly` then forwards that as a
// deliberate choice — `allowDrop` defaults to *true* in the machine, so a cast
// would silently refuse every drop. See ../../props.ts. `showPreview` is not
// forwarded but defaults to true, which Vue's cast would also get wrong.
const props = withDefaults(defineProps<FileUploadProps>(), {
  dropzoneLabel: "Drag files here, or",
  triggerLabel: "Choose files",
  variant: "dropzone",
  size: "md",
  showPreview: true,
  allowDrop: undefined,
  directory: undefined,
  required: undefined,
  disabled: undefined,
});
const emit = defineEmits<{
  "update:acceptedFiles": [files: File[]];
  fileChange: [details: { acceptedFiles: File[]; rejectedFiles: unknown[] }];
  fileReject: [files: unknown[]];
}>();

const attrs = useAttrs();

const isInvalid = computed(() => !!props.error);
const errorMessage = computed(() => (typeof props.error === "string" ? props.error : undefined));
const iconSize = computed(() => CONTROL_ICON_SIZE[props.size]);
const rootClass = computed(() =>
  clsx(fileUploadStyles({ size: props.size, variant: props.variant }), attrs.class as string),
);

const rootProps = computed(() =>
  definedOnly({
    accept: props.accept,
    maxFiles: props.maxFiles,
    maxFileSize: props.maxFileSize,
    minFileSize: props.minFileSize,
    acceptedFiles: props.acceptedFiles,
    defaultAcceptedFiles: props.defaultAcceptedFiles,
    allowDrop: props.allowDrop,
    directory: props.directory,
    required: props.required,
    disabled: props.disabled,
    name: props.name,
  }),
);

// Written here rather than inline: a Vue template expression cannot carry an
// object type annotation, and the handlers' details argument needs one.
function onFileChange(details: { acceptedFiles: File[]; rejectedFiles: unknown[] }) {
  emit("update:acceptedFiles", details.acceptedFiles);
  emit("fileChange", {
    acceptedFiles: details.acceptedFiles,
    rejectedFiles: details.rejectedFiles,
  });
}
function onFileReject(details: { files: unknown[] }) {
  emit("fileReject", details.files);
}
</script>

<template>
  <ArkFileUpload.Root
    :class="rootClass"
    :invalid="isInvalid"
    v-bind="rootProps"
    @file-change="onFileChange"
    @file-reject="onFileReject"
  >
    <!-- See FileUploadLabel for why the label is written out rather than projected. -->
    <FileUploadLabel v-if="label">
      {{ label }}
      <span v-if="required" class="field__required" aria-hidden="true" />
    </FileUploadLabel>

    <!-- `button` drops the dropzone entirely and leaves the trigger alone. -->
    <FileUploadTrigger v-if="variant === 'button'" :label="triggerLabel" :size="size" />
    <!--
      Ark makes the dropzone a focusable `role="button"`, and the real
      "Choose files" button sits inside it — two nested controls, so a screen
      reader cannot say which one focus is on, and a keyboard user hits an
      unnamed outer button before the named inner one.

      The drop area keeps working: dropping is a pointer gesture, and the button
      inside is the keyboard and click path. What goes is only the claim that the
      div is itself a control. Same suppression as the React library.
    -->
    <ArkFileUpload.Dropzone
      v-else
      class="file-upload__dropzone"
      :role="OMIT_ARIA"
      :tabindex="OMIT_ARIA"
      :aria-label="OMIT_ARIA"
    >
      <Icon name="upload" :size="iconSize" class="file-upload__dropzone-icon" />
      <span class="file-upload__dropzone-text">{{ dropzoneLabel }}</span>
      <FileUploadTrigger :label="triggerLabel" :size="size" />
    </ArkFileUpload.Dropzone>

    <!--
      The file list is machine state, so it is read back from context rather
      than mapped over the `acceptedFiles` prop — that keeps the uncontrolled
      case working without the caller holding the list.
    -->
    <ArkFileUpload.ItemGroup class="file-upload__items">
      <ArkFileUpload.Context v-slot="api">
        <ArkFileUpload.Item
          v-for="file in api.acceptedFiles"
          :key="file.name"
          :file="file"
          class="file-upload__item"
        >
          <ArkFileUpload.ItemPreview
            v-if="showPreview"
            type="image/*"
            class="file-upload__item-preview"
          >
            <ArkFileUpload.ItemPreviewImage class="file-upload__item-image" />
          </ArkFileUpload.ItemPreview>
          <!--
            Shown for anything that is not an image — `type` is a filter, and
            Ark renders only the preview whose filter matches.
          -->
          <ArkFileUpload.ItemPreview type=".*" class="file-upload__item-preview">
            <Icon name="file" :size="iconSize" />
          </ArkFileUpload.ItemPreview>
          <span class="file-upload__item-meta">
            <ArkFileUpload.ItemName class="file-upload__item-name" />
            <ArkFileUpload.ItemSizeText class="file-upload__item-size" />
          </span>
          <ArkFileUpload.ItemDeleteTrigger
            class="file-upload__item-delete"
            :aria-label="`Remove ${file.name}`"
          >
            <Icon name="close" :size="DELETE_ICON_SIZE" />
          </ArkFileUpload.ItemDeleteTrigger>
        </ArkFileUpload.Item>
      </ArkFileUpload.Context>
    </ArkFileUpload.ItemGroup>

    <span v-if="helperText && !isInvalid" class="field__description">{{ helperText }}</span>
    <FieldError v-if="isInvalid && errorMessage" :message="errorMessage" />
    <ArkFileUpload.HiddenInput />
  </ArkFileUpload.Root>
</template>
