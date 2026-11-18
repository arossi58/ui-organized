/**
 * Get started — install, wire up the stylesheets, render a component.
 *
 * This page exists because the site had no install instructions at all: `/docs`
 * went Introduction → Foundations → components, and the only setup guidance
 * anywhere shipped inside the Theme Builder's export zip, where it was both
 * hard to find and wrong. Everything here has been
 * checked against a real app build, so the snippets are copy-paste correct.
 *
 * The four libraries differ in exactly the places a reader copies from, so the
 * code is per framework (`getStartedSnippets.ts`) and switches with the same
 * control the component pages use. Picking Vue here keeps Vue on every page.
 */
import { Link } from "react-router-dom";
import { FRAMEWORK_INFO } from "@ui-organized/code-connect/browser";
import { CodeBlock, DocsPageHeader, DocsProse, DocsSection } from "../components";
import { FrameworkSwitcher, useDocsFramework } from "../frameworks";
import styles from "../components/content.module.css";
import { ANGULAR_VITE_CONFIG, ANGULAR_VITE_ENTRY, OWN_WHY, SETUP } from "./getStartedSnippets";
import { pageCss } from "./pageCss";

const PEERS = {
  react: (
    <>
      <code>react</code> and <code>react-dom</code> (&ge;18) are peer dependencies.
    </>
  ),
  svelte: (
    <>
      <code>svelte</code> (&ge;5.20) is a peer dependency. Components bind the Svelte way, with{" "}
      <code>bind:value</code> and <code>bind:open</code>.
    </>
  ),
  vue: (
    <>
      <code>vue</code> (&ge;3.5) is a peer dependency. Listen with <code>@value-change</code>, or
      use <code>v-model</code>.
    </>
  ),
  angular: (
    <>
      <code>@angular/core</code>, <code>@angular/common</code>, <code>@angular/forms</code> and{" "}
      <code>@angular/cdk</code> (&ge;21) are peer dependencies. Form controls work with{" "}
      <code>[(ngModel)]</code> and <code>[formControl]</code> out of the box.
    </>
  ),
} as const;

const INDEX_HTML = `<!-- index.html -->
<html lang="en" data-theme="light">`;

const FONT_LINKS = `<!-- index.html: in <head>, before your stylesheets -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap">`;

const TOGGLE = `document.documentElement.setAttribute('data-theme', 'dark')`;

const CLI_APPLY = `npx @ui-organized/cli theme ~/Downloads/my-theme.zip`;

export function GetStartedPage() {
  const { framework } = useDocsFramework();
  const setup = SETUP[framework];
  const { label, packageName, language } = FRAMEWORK_INFO[framework];
  const isAngular = framework === "angular";
  const [firstIconPkg, ...otherIconPkgs] = setup.iconPackages;
  // The entry imports it relative to `src/`; Angular lists it from the root.
  const ownImport = setup.imports.find((row) => row.why === OWN_WHY)?.path ?? "./index.css";
  const ownStylesheet = ownImport.startsWith("./") ? `src/${ownImport.slice(2)}` : ownImport;

  return (
    <>
      <DocsPageHeader
        title="Get started"
        lede={
          <>
            How to get started with UI Organized for each library.
          </>
        }
      />

      <DocsProse>
        <FrameworkSwitcher label="Framework" />

        <DocsSection title="Install">
          <CodeBlock title={`Install the ${label} library`} code={setup.install} language="sh" />
          <p>{PEERS[framework]}</p>
          <CodeBlock title="Install the data table (optional)" code={setup.table.install} language="sh" />
          <p>
            The table library requires one more stylesheet:
          </p>
          <CodeBlock
            title={isAngular ? "Add the data table stylesheet" : "Import the data table stylesheet"}
            code={setup.table.styles}
            language={setup.table.stylesLanguage ?? "ts"}
          />
          <p>
            Icons come from one of {setup.iconPackages.length === 2 ? "two" : "three"} libraries.
            Install whichever set you picked in the <Link to="/tools">Theme Builder</Link>:
          </p>
          <CodeBlock
            title="Install an icon library"
            code={`npm install ${firstIconPkg}\n# or ${otherIconPkgs.join(", or ")}`}
            language="sh"
          />
          {isAngular && (
            <p className={styles.propNote}>
              Pin the Angular packages to your Angular major. These commands are for Angular 21,
              which the library is tested on; unpinned, npm reaches for the newest major and stops
              with <code>ERESOLVE</code>. Icons too: <code>@ng-icons</code> 35 and later need
              Angular 22, so on Angular 21 install the 34 line,{" "}
              <code>npm install {firstIconPkg}@34</code>.
            </p>
          )}
        </DocsSection>

        <DocsSection title="Add your theme">
          <CodeBlock code={CLI_APPLY} language="sh" />
          <p>
            The CLI writes <code>theme.css</code>, <code>theme.json</code>
            {framework === "react" ? (
              <>
                , <code>fonts.ts</code> and <code>icons.ts</code>
              </>
            ) : (
              <>
                {" "}
                and <code>fonts.ts</code>
              </>
            )}{" "}
            where your project keeps them, after checking the theme covers every token the
            components read. It finishes by printing the stylesheet, icon and font steps for{" "}
            {label}, with your theme's values filled in. Add <code>--dry-run</code> to see the
            plan without writing.
          </p>
          {framework !== "react" && (
            <p className={styles.propNote}>
              The Theme Builder's bundle also holds <code>icons.ts</code>, which is
              React's. The CLI skips it for {label} and prints your icon settings as{" "}
              {label}'s provider instead; see <a href="#set-up-icons">Set up icons</a>.
            </p>
          )}
        </DocsSection>

        <DocsSection title="Wire up the stylesheets">
          {setup.stylesConfig && (
            <>
              <p>
                The Angular CLI takes global stylesheets in <code>angular.json</code>, not as
                imports. List them in this order:
              </p>
              <CodeBlock
                title={setup.stylesConfig.title}
                code={setup.stylesConfig.code}
                language={setup.stylesConfig.language}
              />
              <p>
                Your entry file keeps one import, the icon set, which is code and not a
                stylesheet:
              </p>
            </>
          )}
          <CodeBlock code={setup.entry} language={setup.entryLanguage} />

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col">Import</th>
                  <th scope="col">Purpose</th>
                </tr>
              </thead>
              <tbody>
                {setup.imports.map((row) => (
                  <tr key={row.path}>
                    <td>
                      <span className={styles.propName}>{row.path}</span>
                    </td>
                    <td>{row.why}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p>
            <code>{packageName}/styles</code> and <code>{packageName}/styles.css</code> resolve to
            the same file.{" "}
            {framework === "svelte" || framework === "vue" ? (
              <>
                Use the <code>.css</code> spelling: TypeScript 6 checks side-effect imports by
                default, and the bare <code>/styles</code> subpath ships no type declarations, so{" "}
                {framework === "vue" ? <code>vue-tsc</code> : <code>svelte-check</code>} rejects it.
              </>
            ) : (
              <>Both subpaths are exported, so use whichever spelling your bundler prefers.</>
            )}
          </p>
          {(framework === "svelte" || framework === "vue") && (
            <p>
              Line 2 is optional. Each component imports its own stylesheet, and the library imports
              the typography and base rules they share, so without it your bundle carries the CSS
              for only the components you use. Import <code>{packageName}/styles.css</code> to load
              every component's styles up front, in the order above.
            </p>
          )}
          {isAngular && (
            <p className={styles.propNote}>
              Expect <code>ng build</code> to warn that the initial bundle is over budget. A new
              app's default warning budget is 500&nbsp;kB, and the stylesheets plus a data table
              take a fresh app to roughly 950&nbsp;kB, close to the 1&nbsp;MB error budget. Raise
              both under <code>budgets</code> in <code>angular.json</code>.
            </p>
          )}
        </DocsSection>

        <DocsSection title="Set up icons">
          <CodeBlock code={setup.iconRegister} language="ts" />
          <p>
            {isAngular ? (
              <>
                Then set how icons draw with <code>provideIconConfig</code> in your app's providers:
              </>
            ) : (
              <>
                And <code>IconProvider</code>, around your app, configures how it draws:
              </>
            )}
          </p>
          <CodeBlock code={setup.iconConfig} language={setup.iconConfigLanguage} />

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col">Option</th>
                  <th scope="col">What it does</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <span className={styles.propName}>library</span>
                  </td>
                  <td>
                    Which registered set to draw from. Has to match the subpath
                    you imported.
                  </td>
                </tr>
                <tr>
                  <td>
                    <span className={styles.propName}>
                      {framework === "vue" ? "icon-style" : "style"}
                    </span>
                  </td>
                  <td>
                    <code>outline</code> or <code>solid</code>. Falls back to outline per icon where a library has no solid icons.
                  </td>
                </tr>
                <tr>
                  <td>
                    <span className={styles.propName}>strokeAdjustment</span>
                  </td>
                  <td>
                    Thins the stroke as icons scale up, so a 48px icon doesn't
                    read heavier than a 16px one. For stroke icons only.
                  </td>
                </tr>
                <tr>
                  <td>
                    <span className={styles.propName}>baseSize</span> /{" "}
                    <span className={styles.propName}>baseStroke</span>
                  </td>
                  <td>
                    The reference size and stroke that adjustment is measured from. At{" "}
                    <code>baseSize</code> the stroke is exactly <code>baseStroke</code>. 24 / 2
                    matches Lucide's and Tabler's native weight.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <h3 className={styles.sectionSub}>Using them</h3>
          <p>
            {isAngular ? (
              <>
                <code>uioIcon</code> takes a name, and components with icons, like{" "}
                <code>uioButton</code>, take the same names on their <code>icon</code> input.
              </>
            ) : (
              <>
                <code>Icon</code> takes a name; components that carry icons take the same names on
                an <code>icon</code> prop.
              </>
            )}{" "}
            Pass <code>label</code> when the icon carries meaning on its own. Without it the icon is treated as decorative and hidden from assistive tech.
          </p>
          <CodeBlock code={setup.iconUsage} language={isAngular ? "html" : language} />
          <p>
            The icon names come directly from the library names. <code>ChevronDown</code> becomes{" "}
            <code>chevron-down</code>. A few exports with runs of digits can't be read back
            unambiguously, so register those under the name directly, as in{" "}
            <code>{"{ 'arrow-down-0-1': ArrowDown01 }"}</code>. Or skip registration and pass the
            icon straight through:
          </p>
          <CodeBlock code={setup.iconDirect} language={language} />
        </DocsSection>

        <DocsSection title="Set light or dark mode">
          <CodeBlock code={INDEX_HTML} language="html" />
          <p>
            A theme's <code>:root</code> block is one specific mode. Setting the attribute in your HTML prevents a flash of the wrong mode, with no JavaScript involved.
          </p>
        </DocsSection>

        <DocsSection title="Load the fonts">
          <CodeBlock code={FONT_LINKS} language="html" />
          <p>
            Skip it and you get the theme's <em>metrics</em> (every size, weight and line-height
            exactly right) in whatever fallback the browser picks. That looks deliberate, which is
            why it ships by accident. Don't check by eye: <code>document.fonts.size</code> is{" "}
            <code>0</code> when nothing loaded.
          </p>
        </DocsSection>

        <DocsSection title="Style the page">
          <CodeBlock code={pageCss(ownStylesheet)} language="css" />
          <p>
            The library styles its components, not the page around them. Without this, text
            outside a component renders in the browser's default serif, and in dark mode the
            components sit on a white page. Reading tokens rather than fixed values means the
            page follows your theme and switches with <code>data-theme</code>.
          </p>
        </DocsSection>

        <DocsSection title="Render something">
          <CodeBlock code={setup.app} language={setup.appLanguage} />
          <p>Switch modes at runtime by setting the attribute. There is nothing to re-import:</p>
          <CodeBlock code={TOGGLE} language="ts" />
          <p>
            That's a DOM mutation, so nothing re-renders. Components resolve their colors through
            CSS and update immediately; code that reads <em>resolved</em> token values needs a{" "}
            <code>MutationObserver</code> on <code>data-theme</code>.
          </p>
        </DocsSection>

        {isAngular && (
          <DocsSection
            title="Using Vite instead"
            subtitle="Possible, but the Angular CLI is the path we recommend."
          >
            <p>
              Vite has no <code>angular.json</code>, so the stylesheets go back to being imports in{" "}
              <code>main.ts</code>, in the same order. Vite runs Angular in JIT mode, so the
              compiler loads first:
            </p>
            <CodeBlock code={ANGULAR_VITE_ENTRY} language="ts" />
            <p>And it needs two settings the Angular CLI handles for you:</p>
            <CodeBlock code={ANGULAR_VITE_CONFIG} language="ts" />
            <p className={styles.propNote}>
              JIT mode changes how your own components compile, not just the library's. Signal{" "}
              <code>input()</code>s you declare aren't registered, so nothing binds to them, and
              constructor injection fails because esbuild emits no parameter types. Use{" "}
              <code>inject()</code> instead. If either matters to your app, use the Angular CLI.
            </p>
          </DocsSection>
        )}

        <DocsSection title="Next">
          <ul>
            <li>
              <Link to="/docs/theming">Theming</Link> covers generating a theme, overriding tokens
              by hand, or building the Theme Builder's theme.json with the Vite plugin.
            </li>
            <li>
              <Link to="/docs/foundations/color">Foundations → Color</Link> is the palette and the
              semantic roles your components actually reference.
            </li>
            <li>
              Any component in the sidebar for live examples, props and an Inspect view. Code
              samples follow the framework you picked here.
            </li>
            <li>
              <Link to="/docs/use-with-ai">Use with AI</Link> sets up your coding agent with the
              real components and tokens.
            </li>
          </ul>
        </DocsSection>
      </DocsProse>
    </>
  );
}
