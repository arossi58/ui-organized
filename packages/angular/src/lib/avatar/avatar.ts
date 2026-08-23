import {
  AfterViewInit,
  Component,
  ElementRef,
  computed,
  effect,
  inject,
  input,
  signal,
} from "@angular/core";
import { clsx } from "clsx";
import { avatarStyles, initials, type AvatarVariants } from "@ui-organized/core";
import { UioPart } from "../part.js";
import { nextMachineId } from "../part-ids.js";
import { UioIcon } from "../icons/icon.js";

export type AvatarSize = NonNullable<AvatarVariants["size"]>;
export type AvatarShape = NonNullable<AvatarVariants["shape"]>;

/** Ark sizes the placeholder glyph by the avatar, not by the control scale. */
const ICON_SIZE: Record<AvatarSize, number> = { xs: 14, sm: 16, md: 20, lg: 24, xl: 32 };

/**
 * A person, as a picture with a spoken-for fallback.
 *
 * ```html
 * <div uioAvatar name="Ada Lovelace" src="/ada.png"></div>
 * ```
 *
 * ── The whole component is the load state ───────────────────────────────────
 *
 * Everything else here is a class name. What Ark's machine actually does is
 * decide, at every moment, whether the image or the fallback is the one on
 * screen — and it renders **both**, swapping `hidden` and `data-state` between
 * them rather than mounting one or the other. That matters: a fallback that only
 * exists after the image has failed flashes empty on every slow connection, and
 * an image that is removed on error cannot recover when a later `src` works.
 *
 * So the image starts hidden even though it is in the DOM, and only a `load`
 * event promotes it. The `error` path goes back to the fallback rather than to
 * nothing.
 *
 * ── The case a `load` event never fires for ─────────────────────────────────
 *
 * A cached image is already `complete` before this component's view exists, so
 * its `load` fired before anything was listening and the avatar would sit on the
 * fallback forever. {@link checkImageStatus} is the same catch-up zag does: ask
 * the element whether it finished while nobody was watching. `naturalWidth` is
 * part of the question — a broken image is `complete` too.
 */
@Component({
  selector: "div[uioAvatar]",
  standalone: true,
  imports: [UioIcon],
  template: `
    @if (src(); as source) {
      <img
        class="avatar__image"
        data-scope="avatar"
        data-part="image"
        [id]="partId('image')"
        [src]="source"
        [attr.alt]="alt() ?? name()"
        [attr.hidden]="loaded() ? null : ''"
        [attr.data-state]="loaded() ? 'visible' : 'hidden'"
        (load)="loaded.set(true)"
        (error)="loaded.set(false)"
      />
    }
    <span
      class="avatar__fallback"
      data-scope="avatar"
      data-part="fallback"
      [id]="partId('fallback')"
      [attr.hidden]="loaded() ? '' : null"
      [attr.data-state]="loaded() ? 'hidden' : 'visible'"
    >
      @if (fallback(); as text) {
        {{ text }}
      } @else if (name(); as person) {
        {{ toInitials(person) }}
      } @else {
        <span uioIcon name="user" [size]="iconSize()"></span>
      }
    </span>
  `,
  host: {
    "[class]": "hostClass()",
    "[id]": "rootId",
  },
})
export class UioAvatar extends UioPart implements AfterViewInit {
  readonly scope = "avatar";
  readonly part = "root";

  readonly src = input<string | undefined>(undefined);
  /** Falls back to `name`, which is what a reader would have said anyway. */
  readonly alt = input<string | undefined>(undefined);
  readonly name = input<string | undefined>(undefined);
  /** Overrides the derived initials. A string, because the fallback is text. */
  readonly fallback = input<string | undefined>(undefined);
  readonly size = input<AvatarSize>("md");
  readonly shape = input<AvatarShape | undefined>(undefined);

  private readonly machine = nextMachineId();
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  /** `false` covers both "still loading" and "failed" — Ark shows the fallback for both. */
  protected readonly loaded = signal(false);

  protected readonly toInitials = initials;
  protected readonly iconSize = computed(() => ICON_SIZE[this.size()]);
  protected readonly hostClass = computed(() =>
    clsx(avatarStyles({ size: this.size(), shape: this.shape() })),
  );

  get rootId(): string {
    return `avatar:${this.machine}`;
  }
  protected partId(part: string): string {
    return `avatar:${this.machine}:${part}`;
  }

  constructor() {
    super();
    // A new `src` is a new load. Without this an avatar that swapped a good
    // image for a broken one would keep showing the old one's success.
    effect(() => {
      this.src();
      this.loaded.set(false);
      queueMicrotask(() => this.checkImageStatus());
    });
  }

  ngAfterViewInit(): void {
    this.checkImageStatus();
  }

  /** The catch-up for an image that finished before anything was listening. */
  private checkImageStatus(): void {
    const image = this.host.nativeElement.querySelector<HTMLImageElement>('[data-part="image"]');
    if (!image?.complete) return;
    this.loaded.set(image.naturalWidth !== 0 && image.naturalHeight !== 0);
  }
}
