/**
 * Use with AI — how to point a coding agent at the design system.
 *
 * The specs, tokens and MCP server were only discoverable by already knowing they
 * exist. Each library has its own specs, index and MCP answers, so this page
 * follows the framework picker: a Vue reader is shown the Vue index, the Vue MCP
 * entry and a Vue prompt, never React's.
 */
import { FRAMEWORK_INFO, type DocFramework } from "@ui-organized/code-connect/browser";
import mcpPkg from "../../../../../packages/mcp/package.json";
import { CodeBlock, DocsPageHeader, DocsProse, DocsSection } from "../components";
import { FrameworkSwitcher, useDocsFramework } from "../frameworks";
import { SITE_ORIGIN } from "../../lib/links";

const INIT = `npx @ui-organized/cli init`;

/**
 * The MCP entry `uiorg init` writes: pinned, since the server releases with the
 * libraries at the same version; React's has no flag, the others name their library.
 */
function mcpConfig(framework: DocFramework): string {
  const args = [
    "-y",
    `@ui-organized/mcp@${mcpPkg.version}`,
    ...(framework === "react" ? [] : ["--framework", framework]),
  ];
  return `{
  "mcpServers": {
    "ui-organized": {
      "command": "npx",
      "args": [${args.map((a) => `"${a}"`).join(", ")}]
    }
  }
}`;
}

/** The library's own index and spec path; React keeps the original URLs. */
function paths(framework: DocFramework) {
  return framework === "react"
    ? { index: "llms.txt", full: "llms-full.txt", spec: "ai/<Component>.md" }
    : { index: `llms-${framework}.txt`, full: `llms-full-${framework}.txt`, spec: `ai/${framework}/<Component>.md` };
}

const PROMPTS = `Build a settings page with a profile form: name, email, a timezone select and a Save button.

Add a confirmation dialog before a project is deleted.

Which component should I use to show the filters someone has applied?`;

const FIGMA_PROMPT = `Build this: https://www.figma.com/design/…?node-id=12-345`;

export function UseWithAiPage() {
  const { framework } = useDocsFramework();
  const { label, packageName } = FRAMEWORK_INFO[framework];
  const { index, full, spec } = paths(framework);
  const prompt = `Read ${SITE_ORIGIN}/${index}, then build this using ${packageName}.
Use only the components and tokens it lists: <what you want>`;

  return (
    <>
      <DocsPageHeader
        title="Use with AI"
        lede={
          <>
            Set up your project once, then ask your coding agent for screens, components or a
            Figma design. It builds them from the real {label} library instead of guessing.
          </>
        }
      />

      <DocsProse>
        <FrameworkSwitcher label="Framework" />

        <DocsSection title="Set up your project">
          <p>
            In a project that has <code>{packageName}</code> installed, run:
          </p>
          <CodeBlock code={INIT} language="sh" />
          <p>
            Then restart your agent. Claude Code asks you to approve the new{" "}
            <code>ui-organized</code> MCP server the first time; say yes. Cursor is set up too if
            the project has a <code>.cursor</code> folder.
          </p>
          <p>Options you might need:</p>
          <ul>
            <li>
              <code>--check</code> shows what would change without writing anything.
            </li>
            <li>
              <code>--framework {framework}</code> picks the library when a project has more than
              one installed.
            </li>
            <li>
              <code>--cursor</code> sets up Cursor in a project without a <code>.cursor</code>{" "}
              folder.
            </li>
          </ul>
          <p>
            In a monorepo, run it at the root. It finds the library in your workspace packages.
          </p>
          <p>
            Running it again is safe. It updates its own section of <code>AGENTS.md</code> and{" "}
            <code>CLAUDE.md</code> and its own entry in <code>.mcp.json</code>, and leaves the rest
            of your content alone. The files it owns, the <code>ui-organized-figma</code> skill and
            the Cursor rules, it replaces. Run it again after upgrading {label}, too: the MCP
            server is pinned to the version you have installed.
          </p>
        </DocsSection>

        <DocsSection title="Ask for what you want">
          <p>Describe the screen or the job in your own words. For example:</p>
          <CodeBlock code={PROMPTS} language="text" />
          <p>For better results:</p>
          <ul>
            <li>
              Name the parts you expect, such as "a select" or "a destructive button". The agent
              matches them to the real components and their allowed options.
            </li>
            <li>
              Ask questions as well as for code. The agent can tell you which component fits, what
              props it takes and which token to use for a colour or a gap.
            </li>
            <li>
              If the agent says a component or prop doesn&apos;t exist, pick
              from what it suggests instead. It is checking against {label}&apos;s actual source.
            </li>
          </ul>
        </DocsSection>

        <DocsSection title="Build from a Figma design">
          <p>Connect Figma once, in either of two ways:</p>
          <ul>
            <li>
              <strong>A Figma token.</strong> In Figma, create a personal access token under
              Settings, Security. Set it as <code>FIGMA_TOKEN</code> in the shell you start your
              agent from.
            </li>
            <li>
              <strong>Figma&apos;s own MCP server.</strong> If you already use it, turn it on
              alongside this one. No token is needed.
            </li>
          </ul>
          <p>Then, for each design:</p>
          <ol>
            <li>
              In Figma, select the frame or component and choose <strong>Copy link to
              selection</strong>.
            </li>
            <li>
              Paste the link into your agent:
              <CodeBlock code={FIGMA_PROMPT} language="text" />
              In Claude Code you can also run <code>/ui-organized-figma</code> with the link.
            </li>
            <li>
              Read the agent&apos;s report alongside the code. It lists anything in the frame it
              couldn&apos;t match to a {label} component or token, rather than imitating it by
              eye. Decide what each one should be, or fix it in Figma and ask again.
            </li>
          </ol>
          <p>Designs come through cleanest when, in Figma, you:</p>
          <ul>
            <li>use library components instead of detaching them;</li>
            <li>bind colours, spacing and radius to the library&apos;s variables.</li>
          </ul>
        </DocsSection>

        <DocsSection title="Use another agent">
          <p>
            For an agent <code>init</code> doesn&apos;t set up, add this to its MCP config:
          </p>
          <CodeBlock code={mcpConfig(framework)} language="json" />
          <p>
            Change the version to match the <code>{packageName}</code> you have installed. The
            server answers for that version only. On 6.0.x, use <code>0.1.0</code>, which carries
            6.0.0&apos;s data: the server&apos;s own 6.0.0 was never published.
          </p>
          <p>
            Then tell the agent, in its rules or your prompt, to look up each{" "}
            <code>{packageName}</code> component before using it.
          </p>
        </DocsSection>

        <DocsSection title="Without installing anything">
          <p>
            Any agent that can fetch a web page can read the specs. Start your prompt with:
          </p>
          <CodeBlock code={prompt} language="text" />
          <p>
            For a single component, use the <strong>Copy for AI</strong> button on its docs page
            and paste the result into your chat.
          </p>
          <p>The same content is published as files:</p>
          <ul>
            <li>
              <a href={`${SITE_ORIGIN}/${index}`}>{index}</a>: the {label} index, the best place to
              start.
            </li>
            <li>
              <a href={`${SITE_ORIGIN}/ai/tokens.md`}>ai/tokens.md</a>: every token and when to
              use it.
            </li>
            <li>
              <code>{spec}</code>: one component.
            </li>
            <li>
              <a href={`${SITE_ORIGIN}/${full}`}>{full}</a>: everything in one large file, for
              agents with a big context.
            </li>
          </ul>
        </DocsSection>
      </DocsProse>
    </>
  );
}
