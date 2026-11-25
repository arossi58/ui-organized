import { Component, booleanAttribute, computed, input, output } from "@angular/core";
import { clsx } from "clsx";
import {
  attachmentStyles,
  clampProgress,
  formatFileSize,
  type AttachmentStatus,
  type AttachmentVariants,
} from "@ui-organized/core";
import { UioIcon } from "../icons/icon.js";
import { glyph } from "../icons/glyph.js";

export type { AttachmentStatus };
export type AttachmentVariant = NonNullable<AttachmentVariants["variant"]>;

/**
 * A file, as a row or a chip: name, size or status, progress, and actions.
 *
 * ```html
 * <div uioAttachment name="report.pdf" [size]="48210" removable (remove)="drop()"></div>
 * <div uioAttachment name="clip.mov" status="uploading" [progress]="45"></div>
 * ```
 *
 * The buttons are inputs plus outputs, `removable`/`(remove)` and
 * `retryable`/`(retry)`, as on UioTag: an output alone cannot tell the
 * component whether anything is listening.
 */
@Component({
  selector: "div[uioAttachment]",
  standalone: true,
  imports: [UioIcon],
  template: `
    <span class="attachment__icon" aria-hidden="true"
      ><span uioIcon [name]="glyph(status() === 'error' ? 'alert-circle' : 'file')" [size]="variant() === 'chip' ? 16 : 20"></span
    ></span>
    <span class="attachment__body">
      @if (href(); as link) {
        <a class="attachment__name" [href]="link" download>{{ name() }}</a>
      } @else {
        <span class="attachment__name">{{ name() }}</span>
      }
      @if (meta(); as text) {
        <span class="attachment__meta">{{ text }}</span>
      }
      @if (status() === "uploading" && variant() === "row") {
        <div
          class="attachment__progress"
          role="progressbar"
          [attr.aria-label]="progressLabel() + ' ' + name()"
          aria-valuemin="0"
          aria-valuemax="100"
          [attr.aria-valuenow]="pct()"
        >
          <span class="attachment__progress-bar" [style.width.%]="pct() ?? 0"></span>
        </div>
      }
    </span>
    @if (showRetry() || removable()) {
      <span class="attachment__actions">
        @if (showRetry()) {
          <button
            type="button"
            class="attachment__action"
            [attr.aria-label]="retryLabel() ?? 'Retry ' + name()"
            (click)="retry.emit()"
          >
            <span uioIcon [name]="glyph('refresh')" [size]="16"></span>
          </button>
        }
        @if (removable()) {
          <button
            type="button"
            class="attachment__action"
            [attr.aria-label]="removeLabel() ?? 'Remove ' + name()"
            (click)="remove.emit()"
          >
            <span uioIcon [name]="glyph('close')" [size]="16"></span>
          </button>
        }
      </span>
    }
  `,
  host: {
    "[class]": "hostClass()",
    "[attr.data-status]": "status()",
  },
})
export class UioAttachment {
  protected readonly glyph = glyph;

  readonly name = input.required<string>();
  /** Its size in bytes, shown as 4.2 kB once it is done. */
  readonly size = input<number | undefined>(undefined);
  readonly status = input<AttachmentStatus>("done");
  /** Upload progress, 0 to 100, while `status` is `uploading`. */
  readonly progress = input<number | undefined>(undefined);
  /** What went wrong, while `status` is `error`. */
  readonly error = input<string | undefined>(undefined);
  /** A link to the file: the name becomes a download link. */
  readonly href = input<string | undefined>(undefined);
  readonly variant = input<AttachmentVariant>("row");
  readonly removable = input(false, { transform: booleanAttribute });
  readonly removeLabel = input<string | undefined>(undefined);
  readonly retryable = input(false, { transform: booleanAttribute });
  readonly retryLabel = input<string | undefined>(undefined);
  readonly progressLabel = input("Uploading");
  readonly remove = output<void>();
  readonly retry = output<void>();

  protected readonly pct = computed(() => clampProgress(this.progress()));
  protected readonly showRetry = computed(() => this.status() === "error" && this.retryable());
  protected readonly meta = computed(() => {
    const status = this.status();
    if (status === "uploading") {
      const pct = this.pct();
      return pct != null ? `${this.progressLabel()} ${pct}%` : this.progressLabel();
    }
    if (status === "error") return this.error() ?? "Upload failed";
    const size = this.size();
    return size != null ? formatFileSize(size) : null;
  });
  protected readonly hostClass = computed(() => clsx(attachmentStyles({ variant: this.variant() })));
}
