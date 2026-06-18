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

  // Ark UI has no Button primitive; Base UI's rendered a native <button
  // type="button">, so the facade owns that element directly (default the type
  // to "button" to preserve the no-implicit-submit behavior).
  return (
    <button
      type={type}
      className={clsx(
        buttonStyles({ intent, size }),
        isIconOnly && "btn--icon-only",
        className,
      )}
      {...props}
    >
      {iconPosition === "left" && iconElement}
      {children}
      {iconPosition === "right" && iconElement}
    </button>
  );
}
