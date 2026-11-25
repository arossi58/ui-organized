import { Component, booleanAttribute, computed, input } from "@angular/core";
import { clsx } from "clsx";
import {
  AVATAR_LABEL_TEXT_CLASS,
  AVATAR_STATUS_LABEL,
  avatarLabelAnnouncement,
  avatarLabelStyles,
  type AvatarLabelVariants,
  type AvatarStatus,
} from "@ui-organized/core";
import { UioAvatar, type AvatarShape } from "../avatar/avatar.js";

export type AvatarLabelSize = NonNullable<AvatarLabelVariants["size"]>;

/**
 * An avatar with a name and a line of supporting text beside it. The avatar is
 * hidden from assistive technology, because the name says the same thing; a
 * status or verified badge is announced after the name instead.
 *
 * ```html
 * <div uioAvatarLabel name="Ada Byron" description="ada@example.com" status="online"></div>
 * ```
 */
@Component({
  selector: "div[uioAvatarLabel]",
  standalone: true,
  imports: [UioAvatar],
  template: `
    <div
      uioAvatar
      aria-hidden="true"
      alt=""
      [size]="size()"
      [shape]="shape()"
      [src]="src()"
      [name]="name()"
      [fallback]="fallback()"
      [status]="status()"
      [statusLabel]="statusLabel()"
      [verified]="verified()"
      [verifiedLabel]="verifiedLabel() ?? 'Verified'"
    ></div>
    <div class="avatar-label__text">
      <span [class]="nameClass()">{{ name() }}</span>
      @if (announcement(); as words) {<span class="avatar-label__sr">, {{ words }}</span>}
      @if (description(); as text) {
        <span [class]="descriptionClass()">{{ text }}</span>
      }
    </div>
  `,
  host: { "[class]": "hostClass()" },
})
export class UioAvatarLabel {
  /** The person or entity's name, shown beside the avatar and used for its initials. */
  readonly name = input.required<string>();
  /** A line of supporting text: an email, a role, a handle. */
  readonly description = input<string | undefined>(undefined);
  readonly src = input<string | undefined>(undefined);
  readonly fallback = input<string | undefined>(undefined);
  readonly size = input<AvatarLabelSize>("md");
  readonly shape = input<AvatarShape | undefined>(undefined);
  readonly status = input<AvatarStatus | undefined>(undefined);
  readonly statusLabel = input<string | undefined>(undefined);
  readonly verified = input(false, { transform: booleanAttribute });
  readonly verifiedLabel = input<string | undefined>(undefined);

  protected readonly hostClass = computed(() => avatarLabelStyles({ size: this.size() }));
  protected readonly nameClass = computed(() => clsx("avatar-label__name", AVATAR_LABEL_TEXT_CLASS[this.size()].name));
  protected readonly descriptionClass = computed(() =>
    clsx("avatar-label__description", AVATAR_LABEL_TEXT_CLASS[this.size()].description),
  );
  protected readonly announcement = computed(() => {
    const status = this.status();
    return avatarLabelAnnouncement({
      statusLabel: status ? (this.statusLabel() ?? AVATAR_STATUS_LABEL[status]) : undefined,
      verified: this.verified(),
      verifiedLabel: this.verifiedLabel(),
    });
  });
}
