import { useEffect } from "react";

interface DocumentMeta {
  /** Full document title, including the site suffix. */
  title: string;
  /** Replaces the `<meta name="description">` content for this route. */
  description?: string;
}

/**
 * Sets the document title (and optionally the meta description) for a route,
 * restoring the previous values on unmount.
 *
 * index.html carries a single static title/description for the whole app. React
 * 18 has no native `<title>` hoisting (that landed in 19), and pulling in a
 * helmet library for a handful of routes isn't worth the dependency — so routes
 * that want their own metadata call this from their page component.
 *
 * Restoring on unmount means the static index.html values are what a route
 * without a call gets, rather than whatever the last route happened to set.
 */
export function useDocumentMeta({ title, description }: DocumentMeta) {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title;

    const tag = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    const previousDescription = tag?.content;
    if (tag && description !== undefined) tag.content = description;

    return () => {
      document.title = previousTitle;
      if (tag && previousDescription !== undefined) tag.content = previousDescription;
    };
  }, [title, description]);
}
