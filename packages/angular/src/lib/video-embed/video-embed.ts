import {
  Component,
  ElementRef,
  afterNextRender,
  afterRenderEffect,
  booleanAttribute,
  computed,
  input,
  model,
  signal,
  viewChild,
} from "@angular/core";
import { NgTemplateOutlet } from "@angular/common";
import { clsx } from "clsx";
import { VIDEO_EMBED_ALLOW, videoEmbedKind, videoEmbedStyles } from "@ui-organized/core";
import { UioDialog, UioDialogTitle } from "../dialog/dialog.js";

/**
 * A video behind a poster: nothing loads until the reader presses play.
 *
 * ```html
 * <div uioVideoEmbed src="/tour.mp4" title="Product tour" poster="/tour.jpg"></div>
 * <div uioVideoEmbed [src]="embedUrl" title="Launch talk" lightbox></div>
 * ```
 *
 * Angular will not bind a plain string to an iframe's `src`, and trusting it
 * wholesale would mean a peer dependency on the platform sanitizer. So the
 * iframe's `src` is written after render, and only for an http(s) or relative
 * URL: a `javascript:` URL is never loaded.
 *
 * `title` names the player. It is an input, and the host drops the attribute a
 * static `title="…"` would otherwise leave behind, which would put a tooltip on
 * the whole box.
 */
@Component({
  selector: "div[uioVideoEmbed]",
  standalone: true,
  imports: [NgTemplateOutlet, UioDialog, UioDialogTitle],
  template: `
    @if (background()) {
      <video
        #media
        class="video-embed__media"
        [src]="src()"
        [attr.poster]="poster() ?? null"
        [muted]="true"
        muted
        loop
        playsinline
        preload="metadata"
        aria-hidden="true"
        tabindex="-1"
      ></video>
    } @else {
      @if (playing() && !lightbox()) {
        <ng-container *ngTemplateOutlet="player" />
      } @else {
        <button
          type="button"
          class="video-embed__poster"
          [attr.aria-label]="playLabel() ?? 'Play ' + title()"
          [attr.aria-haspopup]="lightbox() ? 'dialog' : null"
          (click)="play($event)"
        >
          @if (poster(); as image) {<img class="video-embed__image" [src]="image" alt="" />}
          <span class="video-embed__play" aria-hidden="true"></span>
        </button>
      }
      @if (lightbox()) {
        <uio-dialog #dialog [(open)]="open" size="fullscreen">
          <h2 uioDialogTitle class="video-embed__sr">{{ title() }}</h2>
          @if (open()) {
            <div class="video-embed__frame"><ng-container *ngTemplateOutlet="player" /></div>
          }
        </uio-dialog>
      }
    }
    <ng-template #player>
      @if (kind() === "video") {
        <video
          #media
          class="video-embed__media"
          [src]="src()"
          [attr.poster]="poster() ?? null"
          controls
          autoplay
          playsinline
          [attr.aria-label]="title()"
        >
          @if (captions(); as track) {
            <track kind="captions" [src]="track" [attr.srclang]="captionsLang()" default />
          }
        </video>
      } @else {
        <iframe
          #media
          class="video-embed__media"
          [title]="title()"
          [attr.allow]="ALLOW"
          allowfullscreen
        ></iframe>
      }
    </ng-template>
  `,
  host: {
    "[class]": "hostClass()",
    "[style.aspect-ratio]": "aspectRatio() ?? null",
    "[attr.title]": "null",
  },
})
export class UioVideoEmbed {
  /** A video file, or the embed URL of a player page. */
  readonly src = input.required<string>();
  /** What the video is. Names the player, and the play button as "Play {title}". */
  readonly title = input.required<string>();
  /** An image shown until the video plays. */
  readonly poster = input<string | undefined>(undefined);
  /** `video` or `iframe`; inferred from `src` when absent. */
  readonly type = input<"video" | "iframe" | undefined>(undefined);
  /** The box's CSS `aspect-ratio`. Defaults to `16 / 9`. */
  readonly aspectRatio = input<string | undefined>(undefined);
  /** Play in a full-screen dialog instead of in place. */
  readonly lightbox = input(false, { transform: booleanAttribute });
  /** A muted, looping, decorative video with no controls, paused under reduced motion. */
  readonly background = input(false, { transform: booleanAttribute });
  /** The play button's accessible name. Defaults to "Play {title}". */
  readonly playLabel = input<string | undefined>(undefined);
  /** A WebVTT captions file for a `video`, shown by default. */
  readonly captions = input<string | undefined>(undefined);
  /** The captions' language, as a BCP 47 tag. */
  readonly captionsLang = input("en");

  /** Whether the lightbox is open. */
  readonly open = model(false);

  protected readonly ALLOW = VIDEO_EMBED_ALLOW;
  protected readonly playing = signal(false);
  protected readonly kind = computed(() => videoEmbedKind(this.src(), this.type()));
  /** The iframe's URL, when it is http(s) or relative; `null` refuses anything else. */
  private readonly frameSrc = computed(() => {
    const src = this.src();
    try {
      const url = new URL(src, "http://relative.invalid");
      return url.protocol === "http:" || url.protocol === "https:" ? src : null;
    } catch {
      return null;
    }
  });
  protected readonly hostClass = computed(() =>
    clsx(
      videoEmbedStyles(this.background() ? { background: true } : { playing: this.playing() && !this.lightbox() }),
    ),
  );

  private readonly media = viewChild<ElementRef<HTMLVideoElement | HTMLIFrameElement>>("media");
  private readonly dialog = viewChild<UioDialog>("dialog");

  constructor() {
    // A decorative loop starts after mount, and only without reduced motion.
    afterNextRender(() => {
      const video = this.media()?.nativeElement;
      if (!this.background() || !(video instanceof HTMLVideoElement)) return;
      if (typeof window.matchMedia !== "function") return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      void video.play?.()?.catch(() => {});
    });
    // The iframe's src, written here rather than bound; see the class note.
    afterRenderEffect(() => {
      const frame = this.media()?.nativeElement;
      const src = this.frameSrc();
      if (frame instanceof HTMLIFrameElement && src && frame.getAttribute("src") !== src) frame.src = src;
    });
    // The poster button is gone once the player replaces it, so focus follows.
    afterRenderEffect(() => {
      if (this.playing() && !this.lightbox()) this.media()?.nativeElement.focus();
    });
  }

  protected play(event: MouseEvent): void {
    if (this.lightbox()) {
      this.dialog()?.rememberOpener(event.currentTarget as HTMLElement);
      this.open.set(true);
      return;
    }
    this.playing.set(true);
  }
}
