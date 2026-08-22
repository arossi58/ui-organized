import type { HTMLAttributes } from "svelte/elements";
import type { Snippet } from "svelte";
export interface AvatarProps extends Omit<HTMLAttributes<HTMLSpanElement>, "class" | "children" | "id"> {
    /**
     * Narrowed from Svelte's `string | null` because Ark's root props accept only
     * `string | undefined`, and the rest of these props are spread straight onto
     * it. Every component in this package that forwards attributes to an Ark part
     * needs the same narrowing.
     */
    id?: string;
    /** Image source URL. When omitted (or it fails to load) the fallback is shown. */
    src?: string;
    /** Alt text for the image. Falls back to `name`. */
    alt?: string;
    /** Person's name — used to derive initials and as the image alt fallback. */
    name?: string;
    /** Custom fallback content. Overrides the derived initials / user icon. */
    fallback?: Snippet;
    /** Size. Defaults to 'md'. */
    size?: "xs" | "sm" | "md" | "lg" | "xl";
    /** Shape. Defaults to 'circle'. */
    shape?: "circle" | "rounded" | "square";
    class?: string;
}
//# sourceMappingURL=Avatar.types.d.ts.map