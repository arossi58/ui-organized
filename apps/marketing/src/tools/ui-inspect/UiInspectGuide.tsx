/**
 * UI Inspect — the explainer panel for the `@ui-organized/ui-inspect` package.
 *
 * The other gallery entries are apps that run *here*; this one runs in **your**
 * dev server, so there is nothing to embed. The panel is the documentation
 * instead: what the inspector does, how to mount it behind a dev guard, where it
 * reads tokens from, and the options.
 *
 * Snippets reuse the docs `CodeBlock` so copy behaviour (including a failed copy
 * reporting itself) is the same one implementation used everywhere on the site.
 */
import { Button, Icon } from "@ui-organized/react";
import type { ComponentType, ReactNode } from "react";
import {
  ArrowUpRight,
  FileCode,
  Gauge,
  Keyboard,
  Layers,
  Package,
  PencilRuler,
  Pipette,
  ScanEye,
  Shapes,
  ShieldCheck,
  Blocks,
} from "lucide-react";
// Deep import, not the `docs/components` barrel: the barrel is also the docs
// route's entry, so sharing it makes rollup hoist the whole docs kit (prop
// tables, preview surfaces, story examples) into a chunk this panel would then
// have to download for one snippet component.
import { CodeBlock } from "../../docs/components/CodeBlock";
import { LINKS } from "../../lib/links";
import styles from "./ui-inspect-guide.module.css";

/** Compressed screen recording of the inspector, served from `public/inspector/`. */
const DEMO = `${import.meta.env.BASE_URL}inspector/demo`;

const INSTALL = `npm i -D @ui-organized/ui-inspect`;

const MOUNT = `// src/main.tsx: your app entry
if (import.meta.env.DEV) {
  const { mountInspector } = await import("@ui-organized/ui-inspect")
  mountInspector()
}`;

const OPTIONS = `const inspector = mountInspector({
  // start expanded instead of collapsed to the launcher button
  expanded: true,

  // where tokens come from; default is the page's own :root custom properties
  config: {
    source: "css-vars",   // "css-vars" | "dtcg" | "tailwind" | "json"
    root: ":root",
    include: "",          // substring filter for token names
    exclude: "",
  },
})

inspector.destroy()        // unmount and clean up`;

type LucideIcon = ComponentType<Record<string, unknown>>;

interface Feature {
  icon: LucideIcon;
  title: string;
  desc: string;
}

/** What the panel surfaces once you click an element. */
const FEATURES: Feature[] = [
  {
    icon: PencilRuler,
    title: "Quick live edits while you work locally",
    desc: "The main reason to reach for it: change a value on the running page, pick the replacement from your own token scale, and see it immediately. Edits are written as CSS rules into a single rebuilt <style> element, never inline styles, so what you settle on is what you paste back into a stylesheet.",
  },
  {
    icon: Pipette,
    title: "Values resolved against your tokens",
    desc: "Every property shows its computed value and which token it matches, if any, so a hard-coded value and a token-backed one are told apart at a glance.",
  },
  {
    icon: Shapes,
    title: "Matched by value type, not by name",
    desc: "Matching runs on the resolved type (color, length, number, family), never on token names. A property is only audited when your system actually defines tokens of that type, so you never get an “everything is broken” score.",
  },
  {
    icon: Gauge,
    title: "A drift score",
    desc: "One number for how far the page has strayed from the token scale, so you can see the gap close as you fix it.",
  },
  {
    icon: Blocks,
    title: "A component inventory",
    desc: "The components it recovered from the page, with the provenance and confidence of each identification rather than a bare guess.",
  },
];

/** Constraints worth knowing before you reach for it. */
const NOTES: Feature[] = [
  {
    icon: ShieldCheck,
    title: "Dev-only by design",
    desc: "Keep it behind a dev guard. The dynamic import() means it never enters your production bundle.",
  },
  {
    icon: Package,
    title: "Self-contained",
    desc: "React and every other dependency are bundled in, so its dependencies are empty and it can't conflict with your app's React version.",
  },
  {
    icon: Layers,
    title: "CSS-isolated both ways",
    desc: "The panel renders inside a shadow root: the host page's CSS can't reach into it, and its own can't leak out.",
  },
  {
    icon: Keyboard,
    title: "Keyboard-isolated too",
    desc: "It binds no shortcuts of its own, and it keeps the keystrokes you type into its fields from reaching the page. Your app's own single-letter shortcuts stay bound everywhere else, but they won't fire, or eat a character, while you're editing a value in the panel.",
  },
  {
    icon: FileCode,
    title: "ESM only",
    desc: "Ships as ES modules. Any framework works (React, Vue, Svelte, or plain HTML); it inspects the rendered page, not your component tree.",
  },
];

function FeatureList({ items }: { items: Feature[] }) {
  return (
    <ul className={styles.features}>
      {items.map((item) => (
        <li key={item.title} className={styles.feature}>
          <span className={styles.featureIcon}>
            <Icon name={item.icon} size={18} />
          </span>
          <span>
            <span className={styles.featureTitle}>{item.title}</span>
            <span className={styles.featureDesc}>{item.desc}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

function Section({
  title,
  sub,
  children,
}: {
  title: string;
  sub?: string;
  children: ReactNode;
}) {
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>{title}</h2>
      {sub && <p className={styles.sectionSub}>{sub}</p>}
      {children}
    </section>
  );
}

export default function UiInspectGuide() {
  return (
    <div className={styles.root}>
      <article className={styles.column}>
        <header className={styles.hero}>
          <h1 className={styles.title}>
            <span className={styles.titleIcon}>
              <Icon name={ScanEye} size={26} />
            </span>
            UI Inspect
          </h1>
          <p className={styles.lede}>
            A design-system inspector for local development. Click any element in your
            running dev app, see its properties resolved against{" "}
            <strong>that project&rsquo;s</strong> design tokens, and edit them live.
          </p>
          <p className={styles.leadNote}>
            Its primary use is <strong>quick live edits while you work locally</strong>:
            nudge a value against your own token scale, judge it on the real page in the
            real app, and carry what you settle on back into code, without leaving the
            dev server you already have running.
          </p>
          <p className={styles.leadNote}>
            It reads the tokens your page already defines, by default the{" "}
            <code>:root</code> custom properties, so there is nothing to configure. It
            isn&rsquo;t tied to <code>@ui-organized/react</code>: it inspects whatever
            design system the page actually ships, including none.
          </p>
          <div className={styles.ctas}>
            <Button
              intent="primary"
              render={
                <a href={LINKS.npmUiInspect} target="_blank" rel="noreferrer" />
              }
            >
              View on npm
              {/* The DS Button's `icon` prop takes a canonical *name*, which
                  needs the icon registry; every lucide glyph on the site is
                  passed to `Icon` as a component instead. */}
              <Icon name={ArrowUpRight} size={16} />
            </Button>
          </div>
        </header>

        {/* Click-to-play, `preload="none"`: the poster is the only byte that
            loads with the panel, and the clip itself is fetched only if someone
            actually wants the demo. Controls are on because it's a 49s
            walkthrough people will want to scrub. */}
        <figure className={styles.demo}>
          <video
            className={styles.demoVideo}
            src={`${DEMO}.mp4`}
            poster={`${DEMO}.poster.png`}
            controls
            muted
            playsInline
            preload="none"
            aria-label="Screen recording: opening UI Inspect on a running app, selecting an element, replacing its font size with a token from the page's own scale, and reviewing the edit in the Changes tab."
          />
          <figcaption className={styles.demoCaption}>
            A live edit end to end: select an element, swap a hard-coded size for a
            token off the page&rsquo;s own scale, then read the change back out of the
            Changes tab as JSON or Markdown.
          </figcaption>
        </figure>

        <Section
          title="How it works"
          sub="Three steps, all of them in your own project; the inspector never runs on this site."
        >
          <ol className={styles.steps}>
            <li className={styles.step}>
              <div className={styles.stepHead}>
                <span className={styles.stepNum}>1</span>
                <h3 className={styles.stepTitle}>Install it as a dev dependency</h3>
              </div>
              <CodeBlock code={INSTALL} language="sh" />
            </li>

            <li className={styles.step}>
              <div className={styles.stepHead}>
                <span className={styles.stepNum}>2</span>
                <h3 className={styles.stepTitle}>Mount it behind a dev guard</h3>
              </div>
              <p className={styles.body}>
                The dynamic <code>import()</code> is what keeps it out of the production
                bundle; the guard decides whether the module is ever fetched.
              </p>
              <CodeBlock code={MOUNT} language="ts" />
              <p className={styles.body}>
                Not on Vite? Any dev-only guard works:{" "}
                <code>process.env.NODE_ENV !== &quot;production&quot;</code>, a bundler{" "}
                <code>define</code>, or simply not importing it from your production
                entry.
              </p>
            </li>

            <li className={styles.step}>
              <div className={styles.stepHead}>
                <span className={styles.stepNum}>3</span>
                <h3 className={styles.stepTitle}>Open it, then click an element</h3>
              </div>
              <p className={styles.body}>
                Run your dev server and hit the <strong>Inspect</strong> button the
                package mounts in the page. Click anything and the panel resolves that
                element against your token set.
              </p>
            </li>
          </ol>
        </Section>

        <Section title="What you get">
          <FeatureList items={FEATURES} />
        </Section>

        <Section
          title="Options"
          sub="mountInspector(options?) returns { engine, destroy }. engine is the headless inspection engine, exported too if you want to drive it without the panel."
        >
          <CodeBlock code={OPTIONS} language="ts" />
          <p className={styles.body}>
            <code>source</code> is where the token set comes from: the page&rsquo;s own
            CSS custom properties (<code>css-vars</code>, the default), a DTCG token
            file (<code>dtcg</code>), a Tailwind config (<code>tailwind</code>), or
            plain <code>json</code>.
          </p>
        </Section>

        <Section title="Good to know">
          <FeatureList items={NOTES} />
        </Section>
      </article>
    </div>
  );
}
