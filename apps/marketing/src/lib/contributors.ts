import data from "../content/contributors.json";

/**
 * One person in the homepage's "people making it happen" grid. The list lives
 * in src/content/contributors.json and is edited through the dev-only manager
 * at /contributors/manage (contributors-manager/plugin.ts), which also writes
 * each photo to public/contributors/<id>.webp.
 */
export interface Contributor {
  /** Stable slug; also the avatar's filename. */
  id: string;
  name: string;
  /** Opened in a new tab when the avatar is clicked. */
  url: string;
  /** Path under public/, e.g. "contributors/andrew-rossi.webp"; null shows initials. */
  avatar: string | null;
}

export const CONTRIBUTORS: Contributor[] = data;

/** Resolve a stored avatar path against the deploy base. */
export const avatarSrc = (avatar: string | null): string | undefined =>
  avatar ? `${import.meta.env.BASE_URL}${avatar}` : undefined;

/**
 * Fired by the grid's empty "This could be you!" slots; ContactSection listens
 * and switches its segmented control to "I want to contribute".
 */
export const CONTRIBUTE_EVENT = "contact:contribute";
