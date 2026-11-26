import { Component, afterNextRender, computed, input, signal } from "@angular/core";
import {
  detectPlatform,
  kbdLabels,
  kbdStyles,
  type KbdPlatform,
  type KeyPlatform,
} from "@ui-organized/core";

export type { KbdPlatform };
export type KbdSize = "sm" | "md";

/**
 * A key, or a shortcut as a row of keys.
 *
 * ```html
 * <kbd uioKbd [keys]="['mod', 'k']"></kbd>
 * <kbd uioKbd>F5</kbd>
 * ```
 *
 * Each key is a nested `<kbd>`. A key drawn as a symbol (⌘, ⇧, ↵) carries its
 * name as visually hidden text, so a screen reader says "Command K". `auto`
 * draws `other` until after the first render and then the reader's platform,
 * as React's does, so a server-rendered page hydrates to the same markup.
 */
@Component({
  selector: "kbd[uioKbd]",
  standalone: true,
  exportAs: "uioKbd",
  template: `@if (labels(); as list) {
      @for (label of list; track $index) {
        <kbd class="kbd__key">
          @if (label.glyph === label.name) {
            <ng-container>{{ label.glyph }}</ng-container>
          } @else {
            <span aria-hidden="true">{{ label.glyph }}</span
            ><span class="kbd__name">{{ label.name }}</span>
          }
        </kbd>
      }
    } @else {
      <kbd class="kbd__key"><ng-content /></kbd>
    }`,
  host: { "[class]": "hostClass()" },
})
export class UioKbd {
  /** The keys of a shortcut, pressed together: `['mod', 'k']`. Without it, the content is one key. */
  readonly keys = input<readonly string[] | undefined>(undefined);
  readonly size = input<KbdSize>("md");
  /** Whose keys to draw. `auto` follows the reader's platform once rendered. */
  readonly platform = input<KbdPlatform>("auto");

  private readonly detected = signal<KeyPlatform>("other");
  protected readonly labels = computed(() => {
    const keys = this.keys();
    if (!keys) return null;
    const platform = this.platform();
    return kbdLabels(keys, platform === "auto" ? this.detected() : platform);
  });
  protected readonly hostClass = computed(() => kbdStyles({ size: this.size() }));

  constructor() {
    afterNextRender(() => this.detected.set(detectPlatform()));
  }
}
