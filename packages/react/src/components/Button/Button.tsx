import {
  cloneElement,
  isValidElement,
  type ComponentPropsWithoutRef,
  type MouseEvent,
  type ReactElement,
} from "react";
import { clsx } from "clsx";
import { CONTROL_ICON_SIZE, CONTROL_TEXT_CLASS, buttonStyles } from "@ui-organized/core";
import { Icon } from "../Icon/index.js";
import { Spinner } from "../Spinner/index.js";
import type { ButtonProps } from "./Button.types.js";
import "@ui-organized/core/components/Button/Button.css";

/** Drops `undefined` entries, so a cloned element keeps its own value for them. */
function defined<T extends Record<string, unknown>>(values: T): Partial<T> {
  return Object.fromEntries(Object.entries(values).filter(([, value]) => value !== undefined)) as Partial<T>;
}

export function Button({
  intent,
  size = "md",
  icon,
  iconPosition = "left",
  loading = false,
  href,
  target,
  rel,
  download,
  type = "button",
  disabled,
  onClick,
  className,
  children,
  render,
  ...props
}: ButtonProps) {
  const iconElement = icon ? (
    <Icon name={icon} size={CONTROL_ICON_SIZE[size]} />
  ) : null;

  // While loading, the spinner takes the icon's slot, or the leading one when
  // there is no icon. The spinner is decorative: the button itself is marked
  // busy below, which is what assistive technology reads.
  const spinner = loading ? <Spinner size={size} decorative /> : null;
  const spinnerSide = icon ? iconPosition : "left";
  const leading = loading
    ? spinnerSide === "left" ? spinner : null
    : iconPosition === "left" ? iconElement : null;
  const trailing = loading
    ? spinnerSide === "right" ? spinner : null
    : iconPosition === "right" ? iconElement : null;

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
    CONTROL_TEXT_CLASS[size],
    buttonStyles({ intent, size }),
    isIconOnly && "btn--icon-only",
    className,
  );

  const content = (
    <>
      {leading}
      {children}
      {trailing}
    </>
  );

  // Busy, not disabled: `disabled` would drop focus to the document the moment
  // the request starts. The click is swallowed here instead, which also stops
  // a submit button submitting its form a second time.
  const busy = loading
    ? { "aria-busy": true, "aria-disabled": true, "data-loading": "" }
    : {};
  const handleClick = loading
    ? (event: MouseEvent<HTMLElement>) => event.preventDefault()
    : onClick;

  // Polymorphic rendering: clone the supplied element (e.g. an <a> or router
  // Link) as the button instead of a native <button>, merging in the button's
  // classes and props. Lets CTAs be real, crawlable links while staying the
  // library Button — Ark UI has no Button primitive, so this restores what Base
  // UI's `render` prop did before the migration. `type` stays button-only.
  if (isValidElement(render)) {
    const element = render as ReactElement<{ className?: string }>;
    return cloneElement(
      element,
      {
        className: clsx(buttonClass, element.props.className),
        ...busy,
        ...defined({ href, target, rel, download, disabled, onClick: handleClick }),
        ...props,
      },
      content,
    );
  }

  // A real anchor. Inert (disabled or loading), it keeps the link role but
  // loses its `href`, so it can't be followed, opened in a new tab or reached
  // with Tab; `data-disabled` gives it the disabled button's appearance.
  if (href !== undefined) {
    const inert = loading || !!disabled;
    return (
      <a
        className={buttonClass}
        href={inert ? undefined : href}
        target={target}
        rel={rel}
        download={download}
        {...(inert ? { role: "link", "aria-disabled": true } : {})}
        {...(disabled ? { "data-disabled": "" } : {})}
        {...(loading ? { "aria-busy": true, "data-loading": "" } : {})}
        onClick={handleClick as ComponentPropsWithoutRef<"a">["onClick"]}
        {...(props as ComponentPropsWithoutRef<"a">)}
      >
        {content}
      </a>
    );
  }

  // Default: own a native <button>; default type to "button" to preserve the
  // no-implicit-submit behavior.
  return (
    <button type={type} className={buttonClass} disabled={disabled} {...busy} onClick={handleClick} {...props}>
      {content}
    </button>
  );
}
