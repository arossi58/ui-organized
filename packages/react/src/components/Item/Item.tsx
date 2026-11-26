import { cloneElement, isValidElement, useContext, type ReactElement, type ReactNode } from "react";
import { clsx } from "clsx";
import { ITEM_ICON_SIZE, ITEM_TEXT_CLASS, itemStyles } from "@ui-organized/core";
import { Icon } from "../Icon/index.js";
import { ItemGroupContext } from "./ItemGroupContext.js";
import type { ItemProps } from "./Item.types.js";
import "@ui-organized/core/components/Item/Item.css";

/**
 * A row: media, a title with a line of description, and actions at the end.
 * With `href` or `linkRender` the whole row follows the link, and the actions
 * stay their own controls.
 */
export function Item({
  title,
  description,
  icon,
  media,
  actions,
  href,
  target,
  rel,
  linkRender,
  variant = "plain",
  size = "md",
  headingLevel,
  titleId,
  descriptionId,
  className,
  ...props
}: ItemProps) {
  const inGroup = useContext(ItemGroupContext);
  const text = ITEM_TEXT_CLASS[size];
  const Title = headingLevel ? (`h${headingLevel}` as const) : "p";
  const render = isValidElement(linkRender)
    ? (linkRender as ReactElement<{ className?: string; children?: ReactNode }>)
    : null;
  const hasLink = render != null || href != null;

  let label: ReactNode = title;
  if (render) {
    label = cloneElement(render, { className: clsx(render.props.className, "item__link") }, title);
  } else if (href != null) {
    label = (
      <a className="item__link" href={href} target={target} rel={rel}>
        {title}
      </a>
    );
  }

  const mediaContent = media ?? (icon ? <Icon name={icon} size={ITEM_ICON_SIZE[size]} /> : null);

  return (
    <div
      role={inGroup ? "listitem" : undefined}
      className={clsx(itemStyles({ variant, size, link: hasLink }), className)}
      {...props}
    >
      {mediaContent != null && (
        <div className={clsx("item__media", media == null && "item__media--icon")}>
          {mediaContent}
        </div>
      )}
      <div className="item__body">
        <Title id={titleId} className={clsx("item__title", text.title)}>
          {label}
        </Title>
        {description != null && (
          <p id={descriptionId} className={clsx("item__description", text.description)}>
            {description}
          </p>
        )}
      </div>
      {actions != null && <div className="item__actions">{actions}</div>}
    </div>
  );
}
