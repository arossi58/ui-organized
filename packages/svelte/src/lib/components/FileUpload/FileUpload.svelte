<script lang="ts">
  import { FileUpload as ArkFileUpload } from "@ark-ui/svelte";
  import { clsx } from "clsx";
  import { CONTROL_ICON_SIZE, fileUploadStyles, type ControlSize } from "@ui-organized/core";
  import Button from "../Button/Button.svelte";
  import Icon from "../Icon/Icon.svelte";
  import FieldError from "../FieldError/FieldError.svelte";
  import type { FileUploadProps } from "./FileUpload.types.js";
  import "@ui-organized/core/components/FileUpload/FileUpload.css";

  /** Delete affordance inside a file row — always the small edge, because it sits
   *  inside the row rather than beside it. */
  const DELETE_ICON_SIZE = 16;

  let {
    label,
    helperText,
    error,
    accept,
    maxFiles,
    maxFileSize,
    minFileSize,
    acceptedFiles = $bindable(),
    defaultAcceptedFiles,
    onFileChange,
    onFileReject,
    allowDrop,
    directory,
    dropzoneLabel = "Drag files here, or",
    triggerLabel = "Choose files",
    variant = "dropzone",
    size = "md",
    showPreview = true,
    required,
    disabled,
    name,
    class: className,
  }: FileUploadProps = $props();

  const isInvalid = $derived(!!error);
  const errorMessage = $derived(typeof error === "string" ? error : undefined);
  const iconSize = $derived(CONTROL_ICON_SIZE[size as ControlSize]);

  /**
   * Drops `data-invalid` from the label's projected props.
   *
   * zag 1.43 — the machine `@ark-ui/svelte` bundles — stamps `data-invalid` on
   * the label part; zag 1.41, the one `@ark-ui/react` bundles, does not. Note
   * which way round that is: the wrapper version here is the *older* of the two
   * and the machine the newer, so this is the machine leading rather than this
   * library lagging.
   *
   * It comes off anyway, because one stylesheet styles all three libraries and
   * FileUpload.css already selects on `[data-invalid]`. A label that carries the
   * attribute in one library and not the others is how a rule ends up applying
   * to two of three. Delete this once Ark React ships the newer machine — the
   * parity gate reddens at that point and says so.
   */
  function withoutInvalid<T extends object>(props: T): Omit<T, "data-invalid"> {
    const rest = { ...props };
    delete (rest as Record<string, unknown>)["data-invalid"];
    return rest;
  }
</script>

<!--
  The trigger *is* the library Button, projected through Ark's asChild so the
  browse control inherits every interactive token instead of restating them.
  `class` is pulled out and handed over separately because Ark types the
  projected props in Svelte's own shapes, where it is a `ClassValue` that may be
  null while the Button takes a string.
-->
{#snippet trigger()}
  <ArkFileUpload.Trigger>
    {#snippet asChild(props)}
      {@const { class: arkClass, ...triggerProps } = props()}
      <Button intent="secondary" {size} type="button" class={clsx(arkClass)} {...triggerProps}>
        {triggerLabel}
      </Button>
    {/snippet}
  </ArkFileUpload.Trigger>
{/snippet}

<ArkFileUpload.Root
  class={clsx(fileUploadStyles({ size, variant }), className)}
  {accept}
  {maxFiles}
  {maxFileSize}
  {minFileSize}
  {acceptedFiles}
  {defaultAcceptedFiles}
  onFileChange={(details) => {
    acceptedFiles = details.acceptedFiles;
    onFileChange?.({
      acceptedFiles: details.acceptedFiles,
      rejectedFiles: details.rejectedFiles,
    });
  }}
  onFileReject={onFileReject && ((details) => onFileReject(details.files))}
  {allowDrop}
  {directory}
  invalid={isInvalid}
  {required}
  {disabled}
  {name}
>
  {#if label}
    <!-- See `withoutInvalid` above for why the props go through it. -->
    <ArkFileUpload.Label>
      {#snippet asChild(props)}
        <label {...withoutInvalid(props({ class: "field__label" }))}>
          {label}
          {#if required}<span class="field__required" aria-hidden="true"></span>{/if}
        </label>
      {/snippet}
    </ArkFileUpload.Label>
  {/if}

  {#if variant === "button"}
    {@render trigger()}
  {:else}
    <ArkFileUpload.Dropzone class="file-upload__dropzone">
      <Icon name="upload" size={iconSize} class="file-upload__dropzone-icon" />
      <span class="file-upload__dropzone-text">{dropzoneLabel}</span>
      {@render trigger()}
    </ArkFileUpload.Dropzone>
  {/if}

  <!--
    The file list is machine state, so it is read back from context rather than
    mapped over the `acceptedFiles` prop — that keeps the uncontrolled case
    working without the caller holding the list.

    The group is pinned to a <ul> with asChild: `@ark-ui/svelte` renders a <div>
    here while `@ark-ui/react` renders a <ul>, and the two carry different UA
    layout against a stylesheet both libraries share. The caller's class goes
    *through* Ark's props function rather than being spread after it, so Ark's
    own attributes survive the merge.
  -->
  <ArkFileUpload.ItemGroup>
    {#snippet asChild(props)}
      <ul {...props({ class: "file-upload__items" })}>
        <ArkFileUpload.Context>
          {#snippet render(api)}
            {#each api().acceptedFiles as file (file.name)}
              <ArkFileUpload.Item {file} class="file-upload__item">
                {#if showPreview}
                  <ArkFileUpload.ItemPreview type="image/*" class="file-upload__item-preview">
                    <ArkFileUpload.ItemPreviewImage class="file-upload__item-image" />
                  </ArkFileUpload.ItemPreview>
                {/if}
                <!--
                  Shown for anything that is not an image — `type` is a filter,
                  and Ark renders only the preview whose filter matches.
                -->
                <ArkFileUpload.ItemPreview type=".*" class="file-upload__item-preview">
                  <Icon name="file" size={iconSize} />
                </ArkFileUpload.ItemPreview>
                <span class="file-upload__item-meta">
                  <ArkFileUpload.ItemName class="file-upload__item-name" />
                  <ArkFileUpload.ItemSizeText class="file-upload__item-size" />
                </span>
                <ArkFileUpload.ItemDeleteTrigger
                  class="file-upload__item-delete"
                  aria-label={`Remove ${file.name}`}
                >
                  <Icon name="close" size={DELETE_ICON_SIZE} />
                </ArkFileUpload.ItemDeleteTrigger>
              </ArkFileUpload.Item>
            {/each}
          {/snippet}
        </ArkFileUpload.Context>
      </ul>
    {/snippet}
  </ArkFileUpload.ItemGroup>

  {#if helperText && !isInvalid}
    <span class="field__description">{helperText}</span>
  {/if}
  {#if isInvalid && errorMessage}
    <FieldError message={errorMessage} />
  {/if}
  <ArkFileUpload.HiddenInput />
</ArkFileUpload.Root>
