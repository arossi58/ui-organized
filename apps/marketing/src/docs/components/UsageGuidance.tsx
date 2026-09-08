/**
 * The Usage tab's four content shapes: plain bullets, the "when not to use"
 * list with its cross-references, the do/don't pairs, and the related-components
 * list.
 *
 * Everything a guide says is one sentence in an array, so these components own
 * no prose of their own — they resolve slugs to names and links against the live
 * registry (never against a name written into the guide, which a rename would
 * strip of meaning), and hand every string to `InlineMarkdown`.
 */
import { useCallback, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Icon } from "@ui-organized/react";
import { Check, X } from "lucide-react";
import type {
  UsageAlternative,
  UsageAvoid,
  UsageContrast,
} from "@ui-organized/code-connect/usage";
import { pascalFromSlug } from "@ui-organized/code-connect/usage";
import { getDocsComponent } from "../registry";
import type { UsageExampleSet } from "../usage/examples";
import { InlineMarkdown } from "./InlineMarkdown";
import { PreviewSurface } from "./PreviewSurface";
import styles from "./usage.module.css";

/** A cross-reference, resolved against the registry so the name matches its page. */
function ComponentLink({ slug }: { slug: string }) {
  const name = getDocsComponent(slug)?.name ?? pascalFromSlug(slug);
  return <Link to={`/docs/${slug}`}>{name}</Link>;
}

/** `Progress`, or `Menu or Toolbar` — the tail of a "when not to use" line. */
function InsteadClause({ slugs }: { slugs: readonly string[] }) {
  return (
    <>
      {" Use "}
      {slugs.map((slug, index) => (
        <span key={slug}>
          {index > 0 && " or "}
          <ComponentLink slug={slug} />
        </span>
      ))}
      {" instead."}
    </>
  );
}

/**
 * The guide's opening line. Unlabelled on purpose: the page header already
 * carries the component's API description, and a "What it is" heading between
 * the two would read as the same thought said twice.
 */
export function UsageSummary({ text }: { text: string }) {
  return (
    <p className={styles.summary}>
      <InlineMarkdown text={text} />
    </p>
  );
}

export function UsageList({ items }: { items: readonly string[] }) {
  return (
    <ul>
      {items.map((item) => (
        <li key={item}>
          <InlineMarkdown text={item} />
        </li>
      ))}
    </ul>
  );
}

export function UsageAvoidList({ items }: { items: readonly UsageAvoid[] }) {
  return (
    <ul>
      {items.map(({ text, instead }) => (
        <li key={text}>
          <InlineMarkdown text={text} />
          {instead?.length ? <InsteadClause slugs={instead} /> : null}
        </li>
      ))}
    </ul>
  );
}

export function UsageRelatedList({ items }: { items: readonly UsageAlternative[] }) {
  return (
    <ul className={styles.related}>
      {items.map(({ slug, when }) => (
        <li key={slug}>
          <ComponentLink slug={slug} />
          {": when "}
          <InlineMarkdown text={when} />
        </li>
      ))}
    </ul>
  );
}

/**
 * One rule, twice: the arrangement that works beside the failure it prevents.
 *
 * A pair is its own grid rather than the whole set being one two-column grid, so
 * a three-line caption and a one-line caption stay a row — and so the phone
 * layout can't interleave the two halves as it stacks them.
 */
export function UsageGuidanceGrid({
  pairs,
  examples,
  componentName,
}: {
  pairs: readonly UsageContrast[];
  examples: UsageExampleSet;
  /** Named in the error message when an example throws. */
  componentName: string;
}) {
  return (
    <div className={styles.pairs}>
      {pairs.map((pair) => {
        const example = pair.example ? examples[pair.example] : undefined;
        return (
          <div className={styles.pair} key={pair.do}>
            <GuidanceCard kind="do" text={pair.do}>
              {example && (
                <ExampleStage
                  pair={pair}
                  label={`${componentName}: do`}
                  example={example}
                  render={example.Do}
                />
              )}
            </GuidanceCard>
            <GuidanceCard kind="dont" text={pair.dont}>
              {example && (
                <ExampleStage
                  pair={pair}
                  label={`${componentName}: don't`}
                  example={example}
                  render={example.Dont}
                  inert={!example.interactiveDont}
                />
              )}
            </GuidanceCard>
          </div>
        );
      })}
    </div>
  );
}

function GuidanceCard({
  kind,
  text,
  children,
}: {
  kind: "do" | "dont";
  text: string;
  children?: ReactNode;
}) {
  const isDo = kind === "do";
  return (
    <figure className={styles.card} data-kind={kind}>
      {/* The word carries the meaning, the icon and the accent repeat it — so
          the pair still reads with colour ignored, which is also what the
          Inspect tab's vision filters simulate. */}
      <p className={styles.cardKind}>
        <Icon name={isDo ? Check : X} size={14} />
        {isDo ? "Do" : "Don't"}
      </p>
      {children}
      <figcaption className={styles.cardText}>
        <InlineMarkdown text={text} />
      </figcaption>
    </figure>
  );
}

function ExampleStage({
  pair,
  example,
  render: Render,
  label,
  inert = false,
}: {
  pair: UsageContrast;
  example: UsageExampleSet[string];
  render: () => ReactNode;
  label: string;
  inert?: boolean;
}) {
  // `inert` keeps a deliberately-wrong arrangement out of the tab order and out
  // of this page's accessibility findings. React 18 has no prop for it, so it's
  // set on the node — the attribute is what the browser reads, either way.
  const applyInert = useCallback(
    (node: HTMLDivElement | null) => {
      if (node) node.inert = inert;
    },
    [inert],
  );

  return (
    <div className={styles.stage} ref={applyInert} data-example={pair.example}>
      <PreviewSurface
        layout={example.layout ?? "centered"}
        containOverlays={example.containOverlays}
        compact
        label={label}
      >
        <Render />
      </PreviewSurface>
    </div>
  );
}
