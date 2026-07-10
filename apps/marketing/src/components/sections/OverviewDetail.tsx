import type { ComponentType } from "react";
import { Link } from "react-router-dom";
import { Tag, Button, Icon } from "@ui-organized/react";
import {
  ArrowRight,
  ArrowUpRight,
  Boxes,
  Component,
  Github,
  Package,
  Palette,
  RefreshCw,
} from "lucide-react";
import { TOOLS } from "../../lib/tools";
import { LINKS } from "../../lib/links";
import { trackEvent } from "../../lib/analytics";

/** The three overview pillars; the open one is detailed below the card row. */
export type OverviewId = "design" | "tools" | "code";

/**
 * Maps the outbound destinations surfaced in this panel to GA4 conversion
 * events. These are the real "leaving the site to try it" clicks — npm install,
 * the Figma plugin, the source repo — that page views can't infer. Keyed by the
 * exact LINKS value so every place a destination appears reports the same event.
 */
const OUTBOUND_EVENTS: Record<string, string> = {
  [LINKS.npmReact]: "view_npm_package",
  [LINKS.githubFigmaPlugin]: "view_figma_plugin",
  [LINKS.figmaProfile]: "view_figma_plugin",
  [LINKS.github]: "view_github",
};

/** Fire the mapped conversion event for an outbound href, if any. */
function trackOutbound(href: string): void {
  const name = OUTBOUND_EVENTS[href];
  if (name) trackEvent(name, { location: "overview" });
}

type LucideIcon = ComponentType<Record<string, unknown>>;

/** A linkable highlight inside a pillar's detail panel. */
interface DetailItem {
  icon: LucideIcon;
  title: string;
  desc: string;
  /** In-site route or external URL — turns the row into a link. */
  href?: string;
  /** External links open in a new tab and get an out-arrow affordance. */
  external?: boolean;
  /** Status chip (e.g. "Planned") for not-yet-live items. */
  badge?: string;
}

/** A call-to-action button rendered under the pillar's lead. */
interface DetailLink {
  label: string;
  href: string;
  external?: boolean;
  primary?: boolean;
  /** Not-yet-live destinations render as a disabled button with a "Soon" badge. */
  comingSoon?: boolean;
}

interface DetailContent {
  /** Pillar name — the panel eyebrow + accessible region label. */
  title: string;
  heading: string;
  lead: string;
  items: DetailItem[];
  links: DetailLink[];
}

/** The available tools, read straight from the registry. Planned tools are left
 * out of this homepage highlight (they still appear in the full /tools gallery). */
const TOOL_ITEMS: DetailItem[] = TOOLS.filter((tool) => tool.status !== "planned").map(
  (tool) => ({
    icon: tool.icon,
    title: tool.name,
    desc: tool.tagline,
    href: `/tools/${tool.id}`,
    badge: tool.status === "soon" ? "Soon" : undefined,
  }),
);

const DETAILS: Record<OverviewId, DetailContent> = {
  design: {
    title: "Design",
    heading: "An ever-growing Figma library",
    lead: "Every component, color, type style, and spacing step lives in Figma as a published variable — the same tokens that drive the code, so the canvas and the build never drift apart.",
    items: [
      {
        icon: Component,
        title: "Component library",
        desc: "Buttons, inputs, cards, and navigation built with variants and auto-layout to mirror the React components.",
      },
      {
        icon: Palette,
        title: "Token variables",
        desc: "Color, typography, spacing, and radius as Figma variables, with light and dark modes wired up.",
      },
      {
        icon: RefreshCw,
        title: "Synced with code",
        desc: "The Figma plugin imports a theme.json, so changing one brand updates design and code together.",
      },
    ],
    links: [
      { label: "Get the Figma library", href: LINKS.githubFigmaPlugin, external: true, primary: true, comingSoon: true },
      { label: "Build a theme", href: "/tools/theme-builder" },
    ],
  },
  tools: {
    title: "Tools",
    heading: "Generators that do the busywork",
    lead: "A growing gallery of web tools — plus a Figma plugin — that turn the token set into finished, on-brand assets in a few clicks.",
    items: TOOL_ITEMS,
    links: [
      { label: "Open the tools", href: "/tools", primary: true },
      { label: "Figma Plugins", href: LINKS.figmaProfile, external: true },
    ],
  },
  code: {
    title: "Code",
    heading: "Components you can install",
    lead: "Accessible React components built on Base UI and themed entirely by the design tokens. Install from npm and ship UI that matches the canvas exactly.",
    items: [
      {
        icon: Package,
        title: "@ui-organized/react",
        desc: "Accessible components — buttons, inputs, navigation, overlays, and more.",
        href: LINKS.npmReact,
        external: true,
      },
      {
        icon: Boxes,
        title: "Tokens & utilities",
        desc: "@ui-organized/tokens and utils generate CSS variables and typed values from one config.",
      },
      {
        icon: Github,
        title: "Open source",
        desc: "Apache-2.0 on GitHub — browse the source, file an issue, or open a PR.",
        href: LINKS.github,
        external: true,
      },
    ],
    links: [
      { label: "Browse components", href: "/docs", primary: true },
      { label: "View on GitHub", href: LINKS.github, external: true },
    ],
  },
};

/**
 * The library `Button` rendered polymorphically as a router `Link` (in-site) or
 * a real `<a>` (external) via its `render` prop, which clones the button's
 * styling onto the supplied element.
 */
function Cta({ link }: { link: DetailLink }) {
  // Not-yet-live destination: a disabled, non-navigating button that keeps the
  // label but signals status with a "Soon" badge (matching the item rows).
  if (link.comingSoon) {
    return (
      <Button intent={link.primary ? "primary" : "secondary"} disabled>
        {link.label}
        <Tag variant="info" size="sm" emphasized={false}>
          Soon
        </Tag>
      </Button>
    );
  }
  const render = link.external ? (
    <a
      href={link.href}
      target="_blank"
      rel="noreferrer"
      onClick={() => trackOutbound(link.href)}
    />
  ) : (
    <Link to={link.href} />
  );
  return (
    <Button render={render} intent={link.primary ? "primary" : "secondary"}>
      {link.label}
    </Button>
  );
}

function ItemBody({ item }: { item: DetailItem }) {
  return (
    <>
      <span className="ov-detail__item-icon">
        <Icon name={item.icon} size={22} />
      </span>
      <span className="ov-detail__item-text">
        <span className="ov-detail__item-title">
          {item.title}
          {item.badge && (
            <Tag variant="info" size="sm" emphasized={false}>
              {item.badge}
            </Tag>
          )}
          {item.href && (
            <Icon
              name={item.external ? ArrowUpRight : ArrowRight}
              size={16}
              className="ov-detail__item-arrow"
            />
          )}
        </span>
        <span className="ov-detail__item-desc">{item.desc}</span>
      </span>
    </>
  );
}

function Item({ item }: { item: DetailItem }) {
  if (!item.href) {
    return (
      <li className="ov-detail__item">
        <ItemBody item={item} />
      </li>
    );
  }
  return (
    <li>
      {item.external ? (
        <a
          className="ov-detail__item ov-detail__item--link"
          href={item.href}
          target="_blank"
          rel="noreferrer"
          onClick={() => trackOutbound(item.href!)}
        >
          <ItemBody item={item} />
        </a>
      ) : (
        <Link className="ov-detail__item ov-detail__item--link" to={item.href}>
          <ItemBody item={item} />
        </Link>
      )}
    </li>
  );
}

function DetailBody({ content }: { content: DetailContent }) {
  return (
    <div className="ov-detail__inner">
      <div className="ov-detail__intro">
        <h3 className="ov-detail__heading">{content.heading}</h3>
        <p className="ov-detail__lead">{content.lead}</p>
        <div className="ov-detail__ctas">
          {content.links.map((link) => (
            <Cta key={link.label} link={link} />
          ))}
        </div>
      </div>

      <ul className="ov-detail__items">
        {content.items.map((item) => (
          <Item key={item.title} item={item} />
        ))}
      </ul>
    </div>
  );
}

interface OverviewDetailProps {
  /** The id the cards' `aria-controls` point at — always present in the DOM. */
  id: string;
  /** The open pillar, or null when every card is collapsed. */
  openId: OverviewId | null;
}

/**
 * The detail panel shown beneath the overview cards. One pillar is open at a
 * time (Design by default); the container always renders so the cards'
 * `aria-controls` resolve, and fills with the open pillar's content. Switching
 * cards remounts the body (keyed on `openId`) so its enter animation replays.
 */
export function OverviewDetail({ id, openId }: OverviewDetailProps) {
  const content = openId ? DETAILS[openId] : null;

  return (
    <div
      id={id}
      className="ov-detail"
      {...(content ? { role: "region", "aria-label": `${content.title} details` } : {})}
    >
      {content && <DetailBody key={openId} content={content} />}
    </div>
  );
}
