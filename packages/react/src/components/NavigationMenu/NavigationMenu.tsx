import { createContext, useContext, type ReactNode } from "react";
import {
  NavigationMenu as ArkNavigationMenu,
  mergeProps,
  useNavigationMenuContext,
  usePresence,
} from "@ark-ui/react";
import { clsx } from "clsx";
import {
  NAVIGATION_MENU_CHEVRON_SIZE,
  NAVIGATION_MENU_CLASS,
  NAVIGATION_MENU_CLOSE_DELAY,
  NAVIGATION_MENU_LINK_ICON_SIZE,
  NAVIGATION_MENU_OPEN_DELAY,
  navigationMenuContentStyles,
} from "@ui-organized/core";
import { Icon } from "../Icon/index.js";
import { glyph } from "../../icons/glyph.js";
import { projectRender } from "../../utils/projectRender.js";
import type {
  NavigationMenuItemProps,
  NavigationMenuLinkProps,
  NavigationMenuProps,
} from "./NavigationMenu.types.js";
import "@ui-organized/core/components/NavigationMenu/NavigationMenu.css";

/** Inside a panel a link is a row, with an icon and a description; in the bar it is a trigger's twin. */
const InPanelContext = createContext(false);

/**
 * A site's top navigation: triggers that each open a panel of links, and links
 * that go straight to a page. A panel opens on hover, after `openDelay`, or on a
 * click, and arrow keys move along the bar and down into an open panel.
 *
 * ```tsx
 * <NavigationMenu aria-label="Main">
 *   <NavigationMenuItem value="product" label="Product">
 *     <NavigationMenuLink href="/reports" description="Charts of every metric.">Reports</NavigationMenuLink>
 *   </NavigationMenuItem>
 *   <NavigationMenuItem value="pricing" label="Pricing" href="/pricing" />
 * </NavigationMenu>
 * ```
 */
export function NavigationMenu({
  value,
  defaultValue,
  onValueChange,
  openDelay = NAVIGATION_MENU_OPEN_DELAY,
  closeDelay = NAVIGATION_MENU_CLOSE_DELAY,
  className,
  children,
  ...props
}: NavigationMenuProps) {
  return (
    <ArkNavigationMenu.Root
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange ? (details) => onValueChange(details.value) : undefined}
      openDelay={openDelay}
      closeDelay={closeDelay}
      className={clsx(NAVIGATION_MENU_CLASS.root, className)}
      {...props}
    >
      <ArkNavigationMenu.List className={NAVIGATION_MENU_CLASS.list}>
        {children}
      </ArkNavigationMenu.List>
    </ArkNavigationMenu.Root>
  );
}

/**
 * A trigger's panel, rendered from the menu's own props rather than through
 * Ark's `Content` part. That part asks for the viewport element while it
 * renders, which reads `document` and so throws on the server; with no
 * viewport, which this menu never has, the rest of what it does is this.
 */
function NavigationMenuPanel({
  value,
  className,
  children,
}: {
  value: string;
  className: string;
  children: ReactNode;
}) {
  const menu = useNavigationMenuContext();
  const presence = usePresence({ present: menu.value === value });
  const props = mergeProps(menu.getContentProps({ value }), presence.getPresenceProps(), {
    className,
  });
  return (
    <div {...props} ref={presence.ref}>
      {children}
    </div>
  );
}

/**
 * One entry in the bar. With a `label` and children it is a trigger and the
 * panel it opens; with `href` too, a link straight to that page.
 */
export function NavigationMenuItem({
  value,
  label,
  href,
  current,
  disabled,
  columns = 1,
  className,
  children,
  ...props
}: NavigationMenuItemProps) {
  let content = children;
  if (href != null) {
    content = (
      <ArkNavigationMenu.Link
        href={href}
        current={current}
        className={NAVIGATION_MENU_CLASS.trigger}
      >
        {label}
      </ArkNavigationMenu.Link>
    );
  } else if (label != null) {
    content = (
      <>
        {/* zag 1.41, which Ark React runs, leaves `type` off this button; 1.43 adds it. */}
        <ArkNavigationMenu.Trigger type="button" className={NAVIGATION_MENU_CLASS.trigger}>
          {label}
          <Icon
            name={glyph("chevron-down")}
            size={NAVIGATION_MENU_CHEVRON_SIZE}
            className={NAVIGATION_MENU_CLASS.chevron}
          />
        </ArkNavigationMenu.Trigger>
        <NavigationMenuPanel value={value} className={navigationMenuContentStyles({ columns })}>
          <InPanelContext.Provider value>{children}</InPanelContext.Provider>
        </NavigationMenuPanel>
      </>
    );
  }
  return (
    <ArkNavigationMenu.Item
      value={value}
      disabled={disabled}
      className={clsx(NAVIGATION_MENU_CLASS.item, className)}
      {...props}
    >
      {content}
    </ArkNavigationMenu.Item>
  );
}

/**
 * A link. In a panel it is a row with an optional icon and description; as an
 * item's only content it sits in the bar like a trigger. Pass `render` for a
 * router link.
 */
export function NavigationMenuLink({
  current,
  icon,
  description,
  closeOnClick,
  render,
  className,
  children,
  ...props
}: NavigationMenuLinkProps) {
  const inPanel = useContext(InPanelContext);
  const body = inPanel ? (
    <>
      {icon != null && (
        <span className={NAVIGATION_MENU_CLASS.linkIcon}>
          <Icon name={icon} size={NAVIGATION_MENU_LINK_ICON_SIZE} />
        </span>
      )}
      <span className={NAVIGATION_MENU_CLASS.linkBody}>
        <span className={NAVIGATION_MENU_CLASS.linkTitle}>{children}</span>
        {description != null && (
          <span className={NAVIGATION_MENU_CLASS.linkDescription}>{description}</span>
        )}
      </span>
    </>
  ) : (
    children
  );
  const linkProps = {
    current,
    closeOnClick,
    className: clsx(
      inPanel ? NAVIGATION_MENU_CLASS.link : NAVIGATION_MENU_CLASS.trigger,
      className,
    ),
    ...props,
  };
  if (render) {
    return (
      <ArkNavigationMenu.Link asChild {...linkProps}>
        {projectRender(render, body, "NavigationMenuLink")}
      </ArkNavigationMenu.Link>
    );
  }
  return <ArkNavigationMenu.Link {...linkProps}>{body}</ArkNavigationMenu.Link>;
}
