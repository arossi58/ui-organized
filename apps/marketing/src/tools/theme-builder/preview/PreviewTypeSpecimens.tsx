import {
  Card,
  CardBody,
  CardFooter,
  Button,
  Tag,
  Avatar,
  Divider,
  Icon,
} from "@ui-organized/react";
import { useBuilderStore } from "../state/themeState";
import styles from "./PreviewTypeSpecimens.module.css";

/**
 * Typography examples: the live type scale used across five real reading
 * layouts. Where the Specs tab shows every step and weight in isolation, these
 * put the same tokens to work in context (headings, ledes, body copy, and
 * captions composed with design-system components) so the scale can be judged
 * the way it will actually be read.
 *
 * Every text role maps to a `--type-*` custom property (see the type classes in
 * the stylesheet), so all five specimens re-render as the theme's fonts, sizes,
 * leading, and weights change.
 */

function Specimen({ children }: { children: React.ReactNode }) {
  return <section className={styles.specimen}>{children}</section>;
}

// ─── 1 · Editorial article ──────────────────────────────────────────────────

function EditorialSpecimen() {
  return (
    <article className={styles.article}>
      <span className={styles.eyebrow}>Field notes</span>
      <h1 className={styles.displayLg}>The quiet craft of a type scale</h1>
      <p className={styles.lede}>
        A well-tuned scale disappears into the reading. Every step earns its
        place, from the display line that stops you to the caption you barely
        notice.
      </p>
      <div className={styles.byline}>
        <Avatar name="Andrew Rossi" size="sm" />
        <div className={styles.bylineText}>
          <span className={styles.bylineName}>Andrew Rossi</span>
          <span className={styles.caption}>8 min read · March 4, 2026</span>
        </div>
      </div>
      <Divider spacing="md" />
      <p className={styles.body}>
        Good typography is mostly restraint. The temptation is to reach for one
        more weight, one more size, but a scale that reads well is one where
        each role is obvious and the jumps between them feel inevitable.
      </p>
      <h2 className={styles.headingMd}>Rhythm over ornament</h2>
      <p className={styles.body}>
        Line height does more work than font choice. Set your body leading
        first, then let the headings breathe a little tighter. The page will
        feel composed before you&apos;ve picked a single accent.
      </p>
      <blockquote className={styles.pullQuote}>
        “Set the body text, and the rest of the page falls into place.”
      </blockquote>
      <p className={styles.body}>
        When the scale is right, captions and labels can carry real information
        without shouting, and the display sizes have room to make their single,
        deliberate impression.
      </p>
    </article>
  );
}

// ─── 2 · Blog index ─────────────────────────────────────────────────────────

const POSTS = [
  {
    tag: "Guides",
    variant: "info" as const,
    title: "Choosing a base size that scales",
    excerpt:
      "Why 16px is a starting point, not a rule, and how to test a scale against real content before you commit.",
    meta: "Priya Nair · 6 min",
  },
  {
    tag: "Deep dive",
    variant: "success" as const,
    title: "Leading, tracking, and the space between",
    excerpt:
      "The invisible measurements that decide whether a paragraph feels effortless or exhausting to read.",
    meta: "Marco Vidal · 9 min",
  },
  {
    tag: "Opinion",
    variant: "warning" as const,
    title: "You probably have one weight too many",
    excerpt:
      "Every extra weight is a decision your reader has to make. Here's how to prune a type system to what earns its keep.",
    meta: "Lena Fischer · 4 min",
  },
];

function BlogSpecimen() {
  return (
    <ul className={styles.postList}>
      {POSTS.map((p) => (
        <li key={p.title} className={styles.post}>
          <Tag variant={p.variant} size="sm" emphasized={false}>{p.tag}</Tag>
          <div className={styles.postText}>
            <h3 className={styles.headingSm}>{p.title}</h3>
            <p className={styles.bodySm}>{p.excerpt}</p>
            <span className={styles.caption}>{p.meta}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}

// ─── 3 · Marketing hero ─────────────────────────────────────────────────────

const FEATURES = [
  { icon: "grid" as const, title: "One scale", text: "Every size derives from a single base and ratio." },
  { icon: "refresh" as const, title: "Live theming", text: "Re-skin type across the system from one source." },
  { icon: "star" as const, title: "Readable by default", text: "Leading and weight tuned for long-form reading." },
];

function MarketingSpecimen() {
  return (
    <div className={styles.hero}>
      <Tag variant="info" emphasized={false}>Typography · v2</Tag>
      <h1 className={styles.displayXl}>Type that reads itself.</h1>
      <p className={styles.lede}>
        A scale built from tokens, tuned once, and applied everywhere, from the
        loudest hero to the smallest caption.
      </p>
      <div className={styles.heroActions}>
        <Button intent="primary" size="lg" icon="arrow-right" iconPosition="right">
          Get started
        </Button>
        <Button intent="secondary" size="lg">See the scale</Button>
      </div>
      <div className={styles.featureRow}>
        {FEATURES.map((f) => (
          <div key={f.title} className={styles.feature}>
            <span className={styles.featureIcon}><Icon name={f.icon} size={18} /></span>
            <h3 className={styles.headingSm}>{f.title}</h3>
            <p className={styles.bodySm}>{f.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── 4 · Documentation ──────────────────────────────────────────────────────

function DocsSpecimen() {
  return (
    <div className={styles.docs}>
      <span className={styles.docsPath}>Guides / Getting started / Installation</span>
      <h1 className={styles.headingLg}>Installation</h1>
      <p className={styles.body}>
        Add the package with your preferred manager. The design system ships as
        a single dependency with tree-shakeable components.
      </p>
      <pre className={styles.code}><code>pnpm add @ui-organized/react</code></pre>
      <h2 className={styles.headingMd}>Prerequisites</h2>
      <ul className={styles.docsList}>
        <li className={styles.body}>React 18 or later</li>
        <li className={styles.body}>A bundler that supports CSS modules</li>
        <li className={styles.body}>The token stylesheet imported once at your root</li>
      </ul>
      <div className={styles.note}>
        <Icon name="info" size={15} />
        <span className={styles.bodySm}>
          Importing the tokens before your app styles keeps custom properties
          available to every component.
        </span>
      </div>
    </div>
  );
}

// ─── 5 · Pricing ────────────────────────────────────────────────────────────

const TIERS = [
  { name: "Starter", price: "$0", per: "/mo", blurb: "For side projects and prototypes.", intent: "secondary" as const, featured: false },
  { name: "Team", price: "$24", per: "/mo", blurb: "For teams shipping in production.", intent: "primary" as const, featured: true },
];

function PricingSpecimen() {
  return (
    <div className={styles.tierRow}>
      {TIERS.map((t) => (
        <Card
          key={t.name}
          variant={t.featured ? "elevated" : "default"}
          padding="lg"
          className={styles.tierCard}
        >
          <CardBody className={styles.tierBody}>
            <div className={styles.tierNameRow}>
              <span className={styles.headingSm}>{t.name}</span>
              {t.featured && <Tag variant="info" size="sm">Popular</Tag>}
            </div>
            <div className={styles.tierPrice}>
              <span className={styles.displayMd}>{t.price}</span>
              <span className={styles.tierPer}>{t.per}</span>
            </div>
            <p className={styles.bodySm}>{t.blurb}</p>
          </CardBody>
          <CardFooter className={styles.tierFooter}>
            <Button intent={t.intent} className={styles.tierButton}>Choose {t.name}</Button>
            <span className={styles.caption}>No credit card required.</span>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

// ─── Stack ──────────────────────────────────────────────────────────────────

export function PreviewTypeSpecimens() {
  const { lineHeightGuides } = useBuilderStore();

  return (
    <div className={`${styles.root} ${lineHeightGuides ? styles.guides : ""}`}>
      <Specimen><EditorialSpecimen /></Specimen>
      <Specimen><BlogSpecimen /></Specimen>
      <Specimen><MarketingSpecimen /></Specimen>
      <Specimen><DocsSpecimen /></Specimen>
      <Specimen><PricingSpecimen /></Specimen>
    </div>
  );
}
