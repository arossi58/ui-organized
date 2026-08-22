import type { HTMLAttributes } from "svelte/elements";
import type { Snippet } from "svelte";
/**
 * Note what this does *not* narrow.
 *
 * FieldError is an Ark `asChild` target — Ark hands it the props it would have
 * put on its own element, in Svelte's shapes: `id` nullable, `class` a
 * `ClassValue` rather than a string. Narrowing either (as components that
 * forward *into* Ark must) makes the spread fail to typecheck. See
 * `ArkForwardable` in ../../types.ts for the other direction.
 */
export interface FieldErrorProps extends HTMLAttributes<HTMLSpanElement> {
    children?: Snippet;
    /** Message as a plain string, for callers that have no snippet to give. */
    message?: string;
}
//# sourceMappingURL=FieldError.types.d.ts.map