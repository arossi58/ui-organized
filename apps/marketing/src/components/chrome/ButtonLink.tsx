import { Button, type ButtonProps } from "@ui-organized/react";

/**
 * A library `Button` rendered as a real `<a>` element.
 *
 * The site's CTAs must be genuine links — readable and clickable without JS,
 * crawlable for SEO (SITE.md §8) — while still being the library `Button`
 * component (SITE.md §10). The library `Button` takes a `render` element and
 * clones the button's styling onto it, so the rendered DOM node is an anchor.
 */
interface ButtonLinkProps
  extends Omit<ButtonProps, "type" | "value" | "name" | "render"> {
  href: string;
  target?: string;
  rel?: string;
}

export function ButtonLink({ href, target, rel, ...buttonProps }: ButtonLinkProps) {
  return (
    <Button render={<a href={href} target={target} rel={rel} />} {...buttonProps} />
  );
}
