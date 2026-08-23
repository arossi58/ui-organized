/**
 * The reader-facing vocabulary for a bump level.
 *
 * Kept apart from both components so the card's badge, the rail's dot and the
 * group heading can't drift into describing the same release three ways.
 */
import type { TagProps } from "@ui-organized/react";
import type { BumpLevel } from "../../changelog";

/**
 * The design system's own `Tag` variant per bump level.
 *
 * `warning` for major deliberately, not `error`: a major release is a thing to
 * read carefully before upgrading, not a failure. It is also the token the
 * version rail's dot already uses for major, so the card and the rail keep
 * saying the same thing in the same colour.
 */
export const BUMP_VARIANT: Record<BumpLevel, NonNullable<TagProps["variant"]>> = {
  major: "warning",
  minor: "info",
  patch: "success",
};

export const BUMP_LABEL: Record<BumpLevel, string> = {
  major: "Major",
  minor: "Minor",
  patch: "Patch",
};

/** Heading for a group of entries, used only when a release has more than one. */
export const GROUP_LABEL: Record<BumpLevel, string> = {
  major: "Breaking changes",
  minor: "New in this release",
  patch: "Fixes and patches",
};

/**
 * `2026-07-27` → `27 July 2026`. Parsed as UTC parts rather than handed to
 * `new Date("2026-07-27")`, which is midnight UTC and so renders as the day
 * before for anyone west of Greenwich.
 */
export function formatReleaseDate(iso: string): string {
  return format(iso, { day: "numeric", month: "long", year: "numeric" });
}

/** `2026-07-27` → `27 Jul`. The rail is 9rem wide; the long form wraps in it. */
export function formatReleaseDateShort(iso: string): string {
  return format(iso, { day: "numeric", month: "short" });
}

function format(iso: string, options: Intl.DateTimeFormatOptions): string {
  const [year, month, day] = iso.split("-").map(Number);
  if (!year || !month || !day) return iso;
  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString("en-GB", {
    ...options,
    timeZone: "UTC",
  });
}
