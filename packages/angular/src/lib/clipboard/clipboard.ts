import {
  Component,
  DOCUMENT,
  OnDestroy,
  computed,
  inject,
  input,
  output,
  signal,
  type Signal,
} from "@angular/core";
import { clsx } from "clsx";
import {
  CONTROL_ICON_SIZE,
  clipboardStyles,
  type ClipboardVariants,
  type ControlSize,
} from "@ui-organized/core";
import { UioPart, stateFlag } from "../part.js";
import { nextMachineId } from "../part-ids.js";
import { UioButton } from "../button/button.js";
import { UioIcon } from "../icons/icon.js";

export type ClipboardSize = NonNullable<ClipboardVariants["size"]>;
export type ClipboardVariant = NonNullable<ClipboardVariants["variant"]>;

/**
 * A value with a copy button attached.
 *
 * ```html
 * <div uioClipboard value="https://ui-organized.dev" label="Share link"></div>
 * ```
 *
 * ── `data-copied`, on four elements at once ─────────────────────────────────
 *
 * The state is one boolean and Ark writes it onto the root, the label, the
 * control, the input **and** the trigger, so a stylesheet can react at whichever
 * level it needs to. None of those is `UioPart` vocabulary — `data-copied` is
 * this machine's own word — so each one is written here, where they are visible
 * together.
 *
 * ── Two things Ark spells oddly, and both are reproduced ────────────────────
 *
 * The input reports `data-readonly="true"`, not the presence-only `""` that
 * every other boolean state attribute in this system uses. That is zag's own
 * inconsistency rather than a decision, and it is not this port's to correct:
 * the gate compares attribute *values*, so `stateFlag` here would be a
 * difference invented by Angular. It is safe because no stylesheet selects on
 * it — see `state-contract.json`, where Clipboard reads no attributes at all.
 *
 * The trigger's accessible name changes with the state ("Copy to clipboard" →
 * "Copied to clipboard") independently of its visible label, which is what makes
 * the swap announced rather than merely seen.
 *
 * ── The copy itself ─────────────────────────────────────────────────────────
 *
 * The copied state is entered whether or not the write succeeds, exactly as the
 * machine does — a clipboard permission the page does not have is not something
 * the user can act on, and a button that appears to do nothing is worse than one
 * that lies. The rejection is *caught* here where React lets it reject
 * unhandled; that changes no DOM, and an unhandled rejection in a consumer's app
 * is noise they cannot silence.
 */
@Component({
  selector: "div[uioClipboard]",
  standalone: true,
  imports: [UioButton, UioIcon],
  template: `
    @if (label(); as text) {
      <label
        class="field__label"
        data-scope="clipboard"
        data-part="label"
        [id]="partId('label')"
        [attr.for]="partId('input')"
        [attr.data-copied]="flag(copied())"
        >{{ text }}</label
      >
    }
    <div
      class="clipboard__control"
      data-scope="clipboard"
      data-part="control"
      [attr.data-copied]="flag(copied())"
    >
      @if (variant() === "input") {
        <!--
          Read-only rather than disabled: the value still has to be selectable
          with a pointer, and a disabled input is not.
        -->
        <input
          class="clipboard__input"
          data-scope="clipboard"
          data-part="input"
          readonly
          data-readonly="true"
          [id]="partId('input')"
          [attr.value]="value()"
          [attr.data-copied]="flag(copied())"
          (focus)="selectAll($event)"
        />
      }
      <!--
        The trigger *is* the library button, so the copy control inherits every
        interactive token instead of restating them. React reaches the same place
        through Ark's asChild; Angular just puts both on one element.
      -->
      <button
        uioButton
        intent="secondary"
        type="button"
        data-scope="clipboard"
        data-part="trigger"
        [size]="size()"
        [attr.aria-label]="triggerLabel()"
        [attr.data-copied]="flag(copied())"
        (click)="copy()"
      >
        <!--
          Both the glyph and the word swap, and each sits in its own Indicator —
          the same two elements Ark renders, so the shared stylesheet's
          .clipboard__indicator still selects the icon alone.
        -->
        <div class="clipboard__indicator" data-scope="clipboard" data-part="indicator">
          <span uioIcon [name]="copied() ? 'check' : 'copy'" [size]="iconSize()"></span>
        </div>
        <div data-scope="clipboard" data-part="indicator">
          {{ copied() ? copiedLabel() : copyLabel() }}
        </div>
      </button>
    </div>
    @if (helperText(); as text) {
      <span class="field__description">{{ text }}</span>
    }
  `,
  host: {
    "[class]": "hostClass()",
    "[id]": "rootId",
    "[attr.data-copied]": "flag(copied())",
  },
})
export class UioClipboard extends UioPart implements OnDestroy {
  readonly scope = "clipboard";
  readonly part = "root";

  readonly value = input("");
  readonly label = input<string | undefined>(undefined);
  readonly helperText = input<string | undefined>(undefined);
  readonly variant = input<ClipboardVariant>("input");
  readonly size = input<ClipboardSize>("md");
  readonly copyLabel = input("Copy");
  readonly copiedLabel = input("Copied");
  /** Milliseconds the copied state stays visible. Ark's default is 3000. */
  readonly timeout = input(3000);
  readonly statusChange = output<boolean>();

  private readonly machine = nextMachineId();
  private readonly document = inject(DOCUMENT);
  private revert?: ReturnType<typeof setTimeout>;

  protected readonly copied = signal(false);
  protected readonly flag = stateFlag;
  protected readonly iconSize = computed(() => CONTROL_ICON_SIZE[this.size() as ControlSize]);

  /**
   * Deliberately *not* `UioPart.readOnly`.
   *
   * The base writes a presence-only `data-readonly=""`, which is right for every
   * other control in this library and wrong here: zag's clipboard input carries
   * the literal `"true"`. The root, which is what this class is, reports no
   * read-only state at all — only the input does, and it does it in the
   * template.
   */
  override readonly readOnly: Signal<boolean> = signal(false);

  protected readonly triggerLabel = computed(() =>
    this.copied() ? "Copied to clipboard" : "Copy to clipboard",
  );
  protected readonly hostClass = computed(() =>
    clsx(clipboardStyles({ size: this.size(), variant: this.variant() })),
  );

  get rootId(): string {
    return `clip:${this.machine}`;
  }
  protected partId(part: string): string {
    return `clip:${this.machine}:${part}`;
  }

  ngOnDestroy(): void {
    clearTimeout(this.revert);
  }

  /** Focusing the value box selects it, so a keyboard user can copy manually. */
  protected selectAll(event: Event): void {
    (event.target as HTMLInputElement | null)?.select();
  }

  copy(): void {
    void this.write(this.value());
    this.copied.set(true);
    this.statusChange.emit(true);
    // Restarted rather than stacked: a second copy while the first is still
    // showing must extend the state, not revert it early.
    clearTimeout(this.revert);
    this.revert = setTimeout(() => this.copied.set(false), this.timeout());
  }

  /**
   * The async clipboard where it exists, and a selected off-screen node where it
   * does not — the same two paths zag takes, in the same order.
   */
  private async write(text: string): Promise<void> {
    const view = this.document.defaultView;
    try {
      if (view?.navigator.clipboard?.writeText) {
        await view.navigator.clipboard.writeText(text);
        return;
      }
      const node = this.document.createElement("pre");
      Object.assign(node.style, { width: "1px", height: "1px", position: "fixed", top: "5px" });
      node.textContent = text;
      this.document.body.appendChild(node);
      const selection = view?.getSelection();
      if (selection) {
        selection.removeAllRanges();
        const range = this.document.createRange();
        range.selectNodeContents(node);
        selection.addRange(range);
        this.document.execCommand("copy");
        selection.removeAllRanges();
      }
      node.remove();
    } catch {
      // A page without clipboard permission cannot be given one from here, and
      // the state has already flipped — see the class comment.
    }
  }
}
