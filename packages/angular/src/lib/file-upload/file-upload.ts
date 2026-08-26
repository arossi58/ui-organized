import { NgTemplateOutlet } from "@angular/common";
import {
  Component,
  ElementRef,
  booleanAttribute,
  computed,
  inject,
  input,
  model,
  output,
  signal,
  type Signal,
} from "@angular/core";
import {
  CONTROL_ICON_SIZE,
  fileUploadStyles,
  type ControlSize,
  type FileUploadVariants,
} from "@ui-organized/core";
import { UioPart, stateFlag } from "../part.js";
import { VISUALLY_HIDDEN_INPUT, nextMachineId } from "../part-ids.js";
import { UioButton } from "../button/button.js";
import { UioIcon } from "../icons/icon.js";
import { UioFieldError } from "../field-error/field-error.js";

export type FileUploadSize = ControlSize;
export type FileUploadVariant = NonNullable<FileUploadVariants["variant"]>;

/** Why a file was turned away. Zag's codes, so a caller's copy can match. */
export type FileRejectionReason =
  | "FILE_INVALID_TYPE"
  | "FILE_TOO_LARGE"
  | "FILE_TOO_SMALL"
  | "FILE_EXISTS"
  | "TOO_MANY_FILES";

export interface FileRejection {
  file: File;
  errors: FileRejectionReason[];
}

/** Delete affordance inside a file row — always the small edge, because it sits
 *  inside the row rather than beside it. */
const DELETE_ICON_SIZE = 16;

/** Zag's ladder, and the reason 1500 bytes reads as `1.5 kB` and not `1.46 kB`. */
const BYTE_PREFIXES = ["", "kilo", "mega", "giga", "tera", "peta"];

/**
 * A file size in the shape Zag renders it, so the row reads the same in every
 * library.
 *
 * Decimal rather than binary — 1000 to the kilobyte — and three significant
 * figures, which is what turns 1536 into `1.54 kB`. `Intl` supplies the unit
 * name, so the string is localised rather than hand-assembled.
 */
export function formatFileSize(bytes: number, locale = "en-US"): string {
  if (Number.isNaN(bytes)) return "";
  if (bytes === 0) return "0 B";
  let value = Math.abs(bytes);
  let index = 0;
  while (value >= 1000 && index < BYTE_PREFIXES.length - 1) {
    value /= 1000;
    index++;
  }
  const rounded = Number.parseFloat(value.toPrecision(3));
  return new Intl.NumberFormat(locale, {
    style: "unit",
    unit: `${BYTE_PREFIXES[index]}byte`,
    unitDisplay: "short",
  }).format(bytes < 0 ? -rounded : rounded);
}

/**
 * Does a file match an `accept` list? The same test the browser's own file
 * picker applies, so a file dropped past the picker is judged identically.
 */
export function acceptsFile(file: File, accept: string | undefined): boolean {
  if (!accept) return true;
  const types = accept.split(",").filter(Boolean);
  if (!types.length) return true;
  const name = (file.name || "").toLowerCase();
  const mime = (file.type || "").toLowerCase();
  const base = mime.replace(/\/.*$/, "");
  return types.some((entry) => {
    const type = entry.trim().toLowerCase();
    if (type.startsWith(".")) return name.endsWith(type);
    if (type.endsWith("/*")) return base === type.replace(/\/.*$/, "");
    return mime === type;
  });
}

/**
 * A dropzone, a file picker and the list of what has been chosen.
 *
 * ```html
 * <div uioFileUpload label="Attachments" accept="image/*" [maxFiles]="3"></div>
 * ```
 *
 * ── The list is state, not a prop ───────────────────────────────────────────
 *
 * Rows are rendered from the component's own accepted list, so the uncontrolled
 * case works without the caller holding anything — which matters more here than
 * elsewhere, because a `File` cannot be constructed from markup and a list bound
 * from outside would be empty on first paint in every real app.
 *
 * ── Validation happens twice, on purpose ────────────────────────────────────
 *
 * `accept` is put on the hidden input so the operating system's picker filters,
 * *and* checked again on every file that arrives. The picker's filter is
 * advisory — a drop bypasses it entirely, and on some platforms so does "All
 * files" — so a component that trusted it would accept a `.exe` dropped onto a
 * dropzone declaring `image/*`.
 *
 * ── One preview element per filter ──────────────────────────────────────────
 *
 * An image row renders a thumbnail preview *and* the fallback preview; anything
 * else renders only the fallback. That is Ark's arrangement — two `ItemPreview`
 * parts with different filters, of which only the matching ones render — and the
 * stylesheet is written against both being present for an image.
 *
 * There is no `ControlValueAccessor` here, unlike the other controls in this
 * wave: a form posts files through `<input type="file">` and its `FileList`,
 * which is exactly what the hidden input below already is. Wrapping it in a
 * value accessor would give Angular's forms a `File[]` it cannot serialise.
 */
@Component({
  selector: "div[uioFileUpload]",
  standalone: true,
  exportAs: "uioFileUpload",
  imports: [NgTemplateOutlet, UioButton, UioIcon, UioFieldError],
  template: `
    @if (label(); as text) {
      <!--
        No data-invalid here, deliberately: zag 1.43 adds one and the machine
        Ark React bundles does not, so Svelte and Vue strip it. One library
        carrying it is how an invalid rule in FileUpload.css comes to apply to
        one library in three.
      -->
      <label
        class="field__label"
        data-scope="file-upload"
        data-part="label"
        [id]="partId('label')"
        [attr.for]="partId('input')"
        [attr.data-disabled]="flag(isDisabled())"
        [attr.data-required]="flag(required())"
        >{{ text }}@if (required()) {<span class="field__required" aria-hidden="true"></span>}</label
      >
    }

    @if (variant() === "button") {
      <ng-container [ngTemplateOutlet]="triggerTemplate"></ng-container>
    } @else {
      <div
        class="file-upload__dropzone"
        data-scope="file-upload"
        data-part="dropzone"
        role="button"
        aria-label="dropzone"
        [id]="partId('dropzone')"
        [attr.tabindex]="interactive() ? 0 : null"
        [attr.aria-disabled]="interactive() ? null : 'true'"
        [attr.data-invalid]="flag(isInvalid())"
        [attr.data-disabled]="flag(isDisabled())"
        [attr.data-dragging]="flag(dragging())"
        (click)="onDropzoneClick($event)"
        (keydown)="onDropzoneKeydown($event)"
        (dragover)="onDragOver($event)"
        (dragleave)="onDragLeave($event)"
        (drop)="onDrop($event)"
      >
        <span
          uioIcon
          name="upload"
          class="file-upload__dropzone-icon"
          [size]="iconSize()"
        ></span>
        <span class="file-upload__dropzone-text">{{ dropzoneLabel() }}</span>
        <ng-container [ngTemplateOutlet]="triggerTemplate"></ng-container>
      </div>
    }

    <ng-template #triggerTemplate>
      <button
        uioButton
        intent="secondary"
        data-scope="file-upload"
        data-part="trigger"
        [size]="size()"
        [id]="partId('trigger')"
        [attr.data-disabled]="flag(isDisabled())"
        [attr.data-invalid]="flag(isInvalid())"
        [disabled]="isDisabled()"
        (click)="openPicker($event)"
      >
        {{ triggerLabel() }}
      </button>
    </ng-template>

    <ul
      class="file-upload__items"
      data-scope="file-upload"
      data-part="item-group"
      data-type="accepted"
      [attr.data-disabled]="flag(isDisabled())"
    >
      @for (file of acceptedFiles(); track $index) {
        <li
          class="file-upload__item"
          data-scope="file-upload"
          data-part="item"
          data-type="accepted"
          [id]="partId('item:' + $index)"
          [attr.data-disabled]="flag(isDisabled())"
        >
          @if (showPreview() && isImage(file)) {
            <div
              class="file-upload__item-preview"
              data-scope="file-upload"
              data-part="item-preview"
              data-type="accepted"
              [id]="partId('item-preview:' + $index)"
            >
              <img
                class="file-upload__item-image"
                data-scope="file-upload"
                data-part="item-preview-image"
                data-type="accepted"
                [alt]="'preview of ' + file.name"
                [src]="urlFor(file)"
              />
            </div>
          }
          <!--
            Shown for every file, image or not — Ark renders one preview per
            matching filter, and the fallback filter matches everything.
          -->
          <div
            class="file-upload__item-preview"
            data-scope="file-upload"
            data-part="item-preview"
            data-type="accepted"
            [id]="partId('item-preview:' + $index)"
          >
            <span uioIcon name="file" [size]="iconSize()"></span>
          </div>
          <span class="file-upload__item-meta">
            <div
              class="file-upload__item-name"
              data-scope="file-upload"
              data-part="item-name"
              data-type="accepted"
              [id]="partId('item-name:' + $index)"
            >{{ file.name }}</div>
            <div
              class="file-upload__item-size"
              data-scope="file-upload"
              data-part="item-size-text"
              data-type="accepted"
              [id]="partId('item-size:' + $index)"
            >{{ sizeOf(file) }}</div>
          </span>
          <button
            class="file-upload__item-delete"
            data-scope="file-upload"
            data-part="item-delete-trigger"
            type="button"
            data-type="accepted"
            [id]="partId('item-delete:' + $index)"
            [attr.aria-label]="'Remove ' + file.name"
            [attr.data-disabled]="flag(isDisabled())"
            [disabled]="isDisabled()"
            (click)="removeAt($index)"
          >
            <span uioIcon name="close" [size]="DELETE_ICON_SIZE"></span>
          </button>
        </li>
      }
    </ul>

    @if (helperVisible()) {
      <span class="field__description">{{ helperText() }}</span>
    }
    <span uioFieldError [message]="errorMessage()"></span>
    <!--
      The real control. Hidden from assistive tech, because the dropzone and the
      trigger are the accessible interface and a second announced file input is
      noise.
    -->
    <input
      type="file"
      tabindex="-1"
      aria-hidden="true"
      [id]="partId('input')"
      [attr.style]="HIDDEN"
      [attr.name]="name()"
      [attr.required]="required() ? '' : null"
      [attr.accept]="acceptAttr()"
      [attr.webkitdirectory]="directory() ? '' : null"
      [attr.multiple]="multiple() ? '' : null"
      [disabled]="isDisabled()"
      (click)="$event.stopPropagation()"
      (change)="onPicked($event)"
    />
  `,
  host: {
    "[class]": "hostClass()",
    "[id]": "rootId",
    /**
     * Not on `UioPart`. `data-dragging` is what the dropzone's highlight is
     * styled off, and Ark puts it on the root as well as the dropzone.
     */
    "[attr.data-dragging]": "flag(dragging())",
  },
})
export class UioFileUpload extends UioPart {
  readonly scope = "file-upload";
  readonly part = "root";

  /** The chosen files. Two-way, so a caller can clear the list. */
  readonly acceptedFiles = model<File[]>([]);
  readonly fileChange = output<{ acceptedFiles: File[]; rejectedFiles: FileRejection[] }>();
  readonly fileReject = output<FileRejection[]>();

  readonly label = input<string | undefined>(undefined);
  readonly helperText = input<string | undefined>(undefined);
  /** A string shows a message; `true` marks the field invalid without one. */
  readonly error = input<string | boolean | undefined>(undefined);
  /** MIME types or extensions — `"image/*"`, `["image/png", ".pdf"]`. */
  readonly accept = input<string | string[] | undefined>(undefined);
  readonly maxFiles = input(1);
  readonly maxFileSize = input<number | undefined>(undefined);
  readonly minFileSize = input<number | undefined>(undefined);
  readonly allowDrop = input(true, { transform: booleanAttribute });
  readonly directory = input(false, { transform: booleanAttribute });
  readonly dropzoneLabel = input("Drag files here, or");
  readonly triggerLabel = input("Choose files");
  readonly variant = input<FileUploadVariant>("dropzone");
  readonly size = input<FileUploadSize>("md");
  readonly showPreview = input(true, { transform: booleanAttribute });
  readonly required = input(false, { transform: booleanAttribute });
  readonly name = input<string | undefined>(undefined);

  protected readonly disabledInput = input(false, {
    alias: "disabled",
    transform: booleanAttribute,
  });
  private readonly formDisabled = signal(false);
  readonly isDisabled = computed(() => this.disabledInput() || this.formDisabled());
  override readonly disabled: Signal<boolean> = this.isDisabled;

  /**
   * Reported by the dropzone and the trigger, not by the root.
   *
   * Ark's file-upload root carries no `data-invalid` — only the two things a
   * user aims at do — so the base's binding is left at its default rather than
   * overridden.
   */
  protected readonly isInvalid = computed(() => !!this.error());
  protected readonly errorMessage = computed(() =>
    typeof this.error() === "string" ? (this.error() as string) : undefined,
  );
  protected readonly helperVisible = computed(() => !!this.helperText() && !this.isInvalid());

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected readonly hostClass = computed(() =>
    fileUploadStyles({ size: this.size(), variant: this.variant() }),
  );
  protected readonly iconSize = computed(() => CONTROL_ICON_SIZE[this.size()]);
  protected readonly dragging = signal(false);
  protected readonly interactive = computed(() => !this.isDisabled());
  /** More than one file allowed is what `multiple` means to the picker. */
  protected readonly multiple = computed(() => this.maxFiles() > 1);
  protected readonly acceptAttr = computed(() => {
    const accept = this.accept();
    if (accept == null) return null;
    return Array.isArray(accept) ? accept.join(",") : accept;
  });

  protected readonly DELETE_ICON_SIZE = DELETE_ICON_SIZE;
  protected readonly HIDDEN = VISUALLY_HIDDEN_INPUT;
  protected readonly flag = stateFlag;

  private readonly machine = nextMachineId();
  /** Ark's ids are `file:<machine>`, not `file-upload:` — the scope and the id
   *  prefix differ for this one machine. */
  protected get rootId(): string {
    return `file:${this.machine}`;
  }
  protected partId(part: string): string {
    return `file:${this.machine}:${part}`;
  }

  // ── Rows ──────────────────────────────────────────────────────────────────

  protected isImage(file: File): boolean {
    return file.type.startsWith("image/");
  }

  protected sizeOf(file: File): string {
    return formatFileSize(file.size);
  }

  /**
   * Object URLs are cached per file and revoked when the row goes, because a
   * URL created during change detection would be a new one on every pass and
   * the browser would hold every image ever previewed.
   */
  private readonly urls = new Map<File, string>();
  protected urlFor(file: File): string {
    let url = this.urls.get(file);
    if (url == null) {
      // jsdom has no object URLs, and a spec asserting on a file row should not
      // have to stub one in. An empty src renders no image and breaks nothing.
      url = typeof URL.createObjectURL === "function" ? URL.createObjectURL(file) : "";
      this.urls.set(file, url);
    }
    return url;
  }

  protected removeAt(index: number): void {
    if (!this.interactive()) return;
    const next = [...this.acceptedFiles()];
    const [removed] = next.splice(index, 1);
    if (removed) this.release(removed);
    this.setFiles(next, []);
  }

  private release(file: File): void {
    const url = this.urls.get(file);
    if (url == null) return;
    if (url && typeof URL.revokeObjectURL === "function") URL.revokeObjectURL(url);
    this.urls.delete(file);
  }

  // ── Choosing ──────────────────────────────────────────────────────────────

  private inputEl(): HTMLInputElement | null {
    return this.host.nativeElement.querySelector<HTMLInputElement>('input[type="file"]');
  }

  protected openPicker(event: Event): void {
    if (!this.interactive()) return;
    // Inside the dropzone the trigger's click would open the picker twice.
    event.stopPropagation();
    this.inputEl()?.click();
  }

  protected onDropzoneClick(event: MouseEvent): void {
    if (!this.interactive()) return;
    const target = event.target as HTMLElement;
    // Anything focusable inside the dropzone owns its own click.
    if (target.closest("button, a[href], input:not([type='file'])")) return;
    this.inputEl()?.click();
  }

  protected onDropzoneKeydown(event: KeyboardEvent): void {
    if (!this.interactive()) return;
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    this.inputEl()?.click();
  }

  protected onPicked(event: Event): void {
    const element = event.target as HTMLInputElement;
    this.add(Array.from(element.files ?? []));
    // Cleared so that re-picking the same file fires `change` again.
    element.value = "";
  }

  // ── Dropping ──────────────────────────────────────────────────────────────

  protected onDragOver(event: DragEvent): void {
    if (!this.interactive() || !this.allowDrop()) return;
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer) event.dataTransfer.dropEffect = "copy";
    this.dragging.set(true);
  }

  protected onDragLeave(event: DragEvent): void {
    if (!this.interactive() || !this.allowDrop()) return;
    // Moving onto a child fires `dragleave` on the dropzone; only a pointer
    // that has actually left it ends the drag.
    const next = event.relatedTarget as Node | null;
    if (next && (event.currentTarget as HTMLElement).contains(next)) return;
    this.dragging.set(false);
  }

  protected onDrop(event: DragEvent): void {
    if (!this.interactive()) return;
    if (this.allowDrop()) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.dragging.set(false);
    if (!this.allowDrop()) return;
    this.add(Array.from(event.dataTransfer?.files ?? []));
  }

  // ── Validation ────────────────────────────────────────────────────────────

  /**
   * Every arriving file is judged here, whichever way it arrived.
   *
   * The picker's own `accept` filter is advisory and a drop skips it entirely,
   * so this is the only place the rules are actually enforced.
   */
  private add(incoming: File[]): void {
    if (!this.interactive() || !incoming.length) return;
    const current = this.acceptedFiles();
    const accepted: File[] = [];
    const rejected: FileRejection[] = [];

    for (const file of incoming) {
      const errors: FileRejectionReason[] = [];
      if (!acceptsFile(file, this.acceptAttr() ?? undefined)) errors.push("FILE_INVALID_TYPE");
      const max = this.maxFileSize();
      const min = this.minFileSize();
      if (max != null && file.size > max) errors.push("FILE_TOO_LARGE");
      if (min != null && file.size < min) errors.push("FILE_TOO_SMALL");
      const duplicate = [...current, ...accepted].some(
        (existing) => existing.name === file.name && existing.size === file.size,
      );
      if (duplicate) errors.push("FILE_EXISTS");
      if (errors.length) rejected.push({ file, errors });
      else accepted.push(file);
    }

    // All or nothing past the cap, exactly as Zag does: a partial accept would
    // leave the user guessing which of their files got in.
    if (!this.withinRange(accepted.length, current.length)) {
      for (const file of accepted) rejected.push({ file, errors: ["TOO_MANY_FILES"] });
      accepted.length = 0;
    }

    // Single-file mode replaces rather than appends, so the one row a caller
    // asked for stays one row.
    const next = this.multiple()
      ? [...current, ...accepted]
      : accepted.length
        ? [accepted[0]!]
        : current;
    this.setFiles(next, rejected);
  }

  /**
   * Zag's range test, including the rule that looks like an off-by-one.
   *
   * A single-file control with one file already chosen accepts a second — that
   * is what makes choosing again *replace* rather than silently do nothing. The
   * cap only rejects when the total would exceed `maxFiles` and the control is
   * not in that replacement case.
   */
  private withinRange(incoming: number, current: number): boolean {
    if (!this.multiple() && incoming > 1) return false;
    if (!this.multiple() && incoming + current === 2) return true;
    return incoming + current <= this.maxFiles();
  }

  private setFiles(accepted: File[], rejected: FileRejection[]): void {
    this.acceptedFiles.set(accepted);
    this.fileChange.emit({ acceptedFiles: accepted, rejectedFiles: rejected });
    if (rejected.length) this.fileReject.emit(rejected);
  }
}
