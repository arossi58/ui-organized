import { cloneElement, isValidElement, type ReactElement } from "react";
import { clsx } from "clsx";
import { buttonStyles } from "./Button.styles.js";
import { Icon } from "../Icon/index.js";
import type { ButtonProps } from "./Button.types.js";
import "./Button.css";

// Icon size per button size
const ICON_SIZE: Record<NonNullable<ButtonProps["size"]>, number> = {
  sm: 14,
  md: 16,
  lg: 18,
};

export function Button({
  intent,
  size = "md",
  icon,
  iconPosition = "left",
  type = "button",
  className,
  children,
  render,
  ...props
}: ButtonProps) {
  const iconElement = icon ? (
    <Icon name={icon} size={ICON_SIZE[size]} />
  ) : null;

  // An icon with no label collapses to a square (see `.btn--icon-only`) whose
  // side matches the labelled-button height for the size, so icon buttons line
  // up with text buttons instead of rendering short and wide.
  const isIconOnly =
    iconElement != null &&
    (children === undefined ||
      children === null ||
      children === false ||
      children === "");

  const buttonClass = clsx(
    buttonStyles({ intent, size }),
    isIconOnly && "btn--icon-only",
    className,
  );

  const content = (
    <>
      {iconPosition === "left" && iconElement}
      {children}
      {iconPosition === "right" && iconElement}
    </>
  );

  // Polymorphic rendering: clone the supplied element (e.g. an <a> or router
  // Link) as the button instead of a native <button>, merging in the button's
  // classes and props. Lets CTAs be real, crawlable links while staying the
  // library Button — Ark UI has no Button primitive, so this restores what Base
  // UI's `render` prop did before the migration. `type` stays button-only.
  if (isValidElement(render)) {
    const element = render as ReactElement<{ className?: string }>;
    return cloneElement(
      element,
      { className: clsx(buttonClass, element.props.className), ...props },
      content,
    );
  }

  // Default: own a native <button>; default type to "button" to preserve the
  // no-implicit-submit behavior.
  return (
    <button type={type} className={buttonClass} {...props}>
      {content}
    </button>
  );
}
