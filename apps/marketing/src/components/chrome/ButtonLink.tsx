import { Button, type ButtonProps } from "@ui-organized/react";
import type { ReactElement } from "react";

/**
 * A library `Button` rendered as a real `<a>` element.
 *
 * The site's CTAs must be genuine links — readable and clickable without JS,
 * crawlable for SEO (SITE.md §8) — while still being the library `Button`
 * component (SITE.md §10). The underlying base-ui Button supports polymorphic
 * rendering via `render` + `nativeButton`, but the `@ui-organized/react` wrapper's prop
 * type doesn't surface those keys, so we widen it in this one place rather
 * than casting at every call site.
 */
const PolymorphicButton = Button as unknown as React.FC<
  ButtonProps & { render?: ReactElement; nativeButton?: boolean }
>;

interface ButtonLinkProps extends Omit<ButtonProps, "type" | "value" | "name"> {
  href: string;
  target?: string;
  rel?: string;
}

export function ButtonLink({ href, target, rel, ...buttonProps }: ButtonLinkProps) {
  return (
    <PolymorphicButton
      nativeButton={false}
      render={<a href={href} target={target} rel={rel} />}
      {...buttonProps}
    />
  );
}
