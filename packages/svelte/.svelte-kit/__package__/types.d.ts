/**
 * The `id` mismatch, named once.
 *
 * Svelte's `HTMLAttributes` types `id` as `string | null | undefined`, and Ark's
 * part props accept only `string | undefined`. Any component that forwards
 * attributes *into* an Ark part therefore has to narrow it, or the spread fails
 * to typecheck with a union-too-complex error that says nothing useful about the
 * actual cause.
 *
 * Components that render a plain element instead — FieldError's span, Divider's
 * div — need no narrowing, and must not have it. They sit on the receiving end
 * of an Ark `asChild`, which hands them the props it would have used itself in
 * Svelte's own shapes: `id` nullable, and `class` a `ClassValue` rather than a
 * string. Narrowing either one breaks the spread.
 */
export type ArkForwardable<T> = Omit<T, "id"> & {
    id?: string;
};
//# sourceMappingURL=types.d.ts.map