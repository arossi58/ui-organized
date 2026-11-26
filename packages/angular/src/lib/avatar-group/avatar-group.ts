import { Component, computed, input } from "@angular/core";
import { clsx } from "clsx";
import {
  avatarGroupStyles,
  avatarStyles,
  defaultAvatarGroupMoreLabel,
  splitAvatarGroup,
} from "@ui-organized/core";
import { UioAvatar, type AvatarShape, type AvatarSize } from "../avatar/avatar.js";

/** One person or entity in an AvatarGroup. */
export interface AvatarGroupItem {
  src?: string;
  /** Used for initials and as the image's alt text. */
  name?: string;
  alt?: string;
  /** Text in place of the initials. */
  fallback?: string;
}

/**
 * Overlapping avatars for the people on something, with a `+N` for the rest.
 * Data-driven, as in every library, so the four count `max` the same way.
 *
 * ```html
 * <div uioAvatarGroup [items]="members" [max]="4" label="Project members"></div>
 * ```
 */
@Component({
  selector: "div[uioAvatarGroup]",
  standalone: true,
  imports: [UioAvatar],
  template: `
    @for (item of split().shown; track $index) {
      <div
        uioAvatar
        [size]="size()"
        [shape]="shape()"
        [src]="item.src"
        [name]="item.name"
        [alt]="item.alt"
        [fallback]="item.fallback"
      ></div>
    }
    @if (split().overflow > 0) {
      <span [class]="overflowClass()" role="img" [attr.aria-label]="moreLabel()(split().overflow)">+{{ split().overflow }}</span>
    }
  `,
  host: {
    "[class]": "hostClass()",
    role: "group",
    "[attr.aria-label]": "label() ?? null",
  },
})
export class UioAvatarGroup {
  readonly items = input.required<AvatarGroupItem[]>();
  /** The most avatars to show, counting the `+N` as one. Shows every item when unset. */
  readonly max = input<number | undefined>(undefined);
  readonly size = input<AvatarSize>("md");
  readonly shape = input<AvatarShape | undefined>(undefined);
  /** The group's accessible name: "Project members". */
  readonly label = input<string | undefined>(undefined);
  /** The `+N` avatar's accessible name. */
  readonly moreLabel = input<(count: number) => string>(defaultAvatarGroupMoreLabel);

  protected readonly split = computed(() => splitAvatarGroup(this.items(), this.max()));
  protected readonly hostClass = computed(() => avatarGroupStyles({ size: this.size() }));
  protected readonly overflowClass = computed(() =>
    clsx(avatarStyles({ size: this.size(), shape: this.shape() }), "avatar-group__overflow"),
  );
}
