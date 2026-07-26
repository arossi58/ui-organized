import { cloneElement, isValidElement, type ReactElement, type ReactNode } from "react";

/**
 * Resolve the element an `asChild` trigger should project when both `render` and
 * `children` are supplied.
 *
 * Every `render`-prop trigger in the library used to be written as:
 *
 * ```tsx
 * if (render) return <Ark.Trigger asChild {...props}>{render}</Ark.Trigger>;
 * ```
 *
 * …which silently drops `children`. The reported symptom was an icon-only button
 * with no label and no warning:
 *
 * ```tsx
 * <PopoverTrigger render={<Button icon="plus" />}>Add item</PopoverTrigger>
 * ```
 *
 * "Add item" simply vanished. Both props are legitimate together — `render`
 * chooses the element, `children` its content — so the fix is to project the
 * children into the rendered element rather than discard them.
 *
 * When the rendered element already has its own children, we keep those and warn
 * in development: that combination is genuinely ambiguous, and silently
 * preferring either one would be another invisible surprise.
 */
export function projectRender(render: ReactElement, children: ReactNode, component: string): ReactElement {
  if (children === undefined || children === null || children === false) return render;
  if (!isValidElement(render)) return render;

  const ownChildren = (render.props as { children?: ReactNode }).children;
  const hasOwnChildren =
    ownChildren !== undefined && ownChildren !== null && ownChildren !== false;

  if (hasOwnChildren) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `[@ui-organized/react] <${component}> received both \`render\` (which already has children) ` +
          `and \`children\`. Keeping the rendered element's own children and ignoring \`children\`. ` +
          `Put the content in one place or the other.`,
      );
    }
    return render;
  }

  return cloneElement(render, undefined, children);
}
