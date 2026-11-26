<script lang="ts">
  import { clsx } from "clsx";
  import { attachmentStyles, clampProgress, formatFileSize } from "@ui-organized/core";
  import Icon from "../Icon/Icon.svelte";
  import { glyph } from "../../icons/glyph.js";
  import type { AttachmentProps } from "./Attachment.types.js";
  import "@ui-organized/core/components/Attachment/Attachment.css";

  // A file, as a row or a chip: name, size or status, progress, and actions.
  let {
    name,
    size,
    status = "done",
    progress,
    error,
    href,
    variant = "row",
    onRemove,
    removeLabel,
    onRetry,
    retryLabel,
    progressLabel = "Uploading",
    class: className,
    ...rest
  }: AttachmentProps = $props();

  const pct = $derived(clampProgress(progress));
  const meta = $derived(
    status === "uploading"
      ? pct != null
        ? `${progressLabel} ${pct}%`
        : progressLabel
      : status === "error"
        ? (error ?? "Upload failed")
        : size != null
          ? formatFileSize(size)
          : null,
  );
  const retry = $derived(status === "error" && !!onRetry);
</script>

<div class={clsx(attachmentStyles({ variant }), className)} data-status={status} {...rest}>
  <span class="attachment__icon" aria-hidden="true">
    <Icon name={glyph(status === "error" ? "alert-circle" : "file")} size={variant === "chip" ? 16 : 20} />
  </span>
  <span class="attachment__body">
    {#if href}
      <a class="attachment__name" {href} download>{name}</a>
    {:else}
      <span class="attachment__name">{name}</span>
    {/if}
    {#if meta}<span class="attachment__meta">{meta}</span>{/if}
    {#if status === "uploading" && variant === "row"}
      <div
        class="attachment__progress"
        role="progressbar"
        aria-label={`${progressLabel} ${name}`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct ?? undefined}
      >
        <span class="attachment__progress-bar" style:width={`${pct ?? 0}%`}></span>
      </div>
    {/if}
  </span>
  {#if retry || onRemove}
    <span class="attachment__actions">
      {#if retry}
        <button type="button" class="attachment__action" aria-label={retryLabel ?? `Retry ${name}`} onclick={() => onRetry?.()}>
          <Icon name={glyph("refresh")} size={16} />
        </button>
      {/if}
      {#if onRemove}
        <button type="button" class="attachment__action" aria-label={removeLabel ?? `Remove ${name}`} onclick={() => onRemove?.()}>
          <Icon name={glyph("close")} size={16} />
        </button>
      {/if}
    </span>
  {/if}
</div>
