/**
 * Use with AI — how to point a coding agent at the design system.
 *
 * The specs, tokens and MCP server were only discoverable by already knowing they
 * exist. Only `@ui-organized/react` is covered, and this page says so rather than
 * letting a Vue reader's agent be taught React.
 */
import { CodeBlock, DocsPageHeader, DocsProse, DocsSection } from "../components";
import { SITE_ORIGIN } from "../../lib/links";

const INIT = `npx @ui-organized/cli init`;

const MCP_CONFIG = `{
  "mcpServers": {
    "ui-organized": {
      "command": "npx",
      "args": ["-y", "@ui-organized/mcp"]
    }
  }
}`;

const PROMPT = `Read ${SITE_ORIGIN}/llms.txt, then build this using @ui-organized/react.
Use only the components and tokens it lists: <what you want>`;

export function UseWithAiPage() {
  return (
    <>
      <DocsPageHeader
        title="Use with AI"
        lede={
          <>
            Give your coding agent the real components and tokens, so it uses what exists instead
            of inventing props, values and token names that look right and do nothing.
          </>
        }
      />

      <DocsProse>
        <DocsSection title="Set up your project">
          <p>Run this in a project that has <code>@ui-organized/react</code> installed:</p>
          <CodeBlock code={INIT} language="sh" />
          <p>
            It adds the design system's rules to <code>AGENTS.md</code> and{" "}
            <code>CLAUDE.md</code>, and registers the MCP server in <code>.mcp.json</code>. If the
            project has a <code>.cursor</code> folder, it sets up Cursor too; pass{" "}
            <code>--cursor</code> to do that anyway. Your own content in those files stays as it
            is, and <code>--check</code> shows the changes without writing them.
          </p>
          <p>
            Svelte, Vue and Angular aren't covered yet. The specs and tools describe the React
            library, so <code>init</code> stops rather than teach your agent the wrong code.
          </p>
        </DocsSection>

        <DocsSection title="Add the MCP server by hand">
          <p>For any other agent, add this to its MCP config:</p>
          <CodeBlock code={MCP_CONFIG} language="json" />
          <p>It offers these tools, and only the Figma one uses a network or a key:</p>
          <ul>
            <li>
              <code>search_components</code> finds a component by name.
            </li>
            <li>
              <code>get_component</code> returns its import, props, allowed values and usage rules.
            </li>
            <li>
              <code>search_tokens</code> finds a token by purpose, such as "padding" or "error
              text".
            </li>
            <li>
              <code>get_token</code> checks a name and rejects any that don't exist.
            </li>
            <li>
              <code>get_figma_frame</code> turns a Figma frame into compact code using real
              components and tokens.
            </li>
          </ul>
        </DocsSection>

        <DocsSection title="Build from a Figma design">
          <p>
            Set <code>FIGMA_TOKEN</code> in your shell to a Figma personal access token, then paste
            a frame's link into your agent. It gets each library component as one line of real code
            instead of every layer inside it.
          </p>
          <p>For designs that translate cleanly:</p>
          <ul>
            <li>Use library components rather than detaching them.</li>
            <li>Bind colours, spacing and radius to the library's variables.</li>
          </ul>
          <p>
            Anything else comes back flagged, so the agent reports it to you instead of rebuilding
            it by eye.
          </p>
        </DocsSection>

        <DocsSection title="Without installing anything">
          <p>Any agent that can fetch a URL can read the specs directly. Start a prompt with:</p>
          <CodeBlock code={PROMPT} language="text" />
          <ul>
            <li>
              <a href={`${SITE_ORIGIN}/llms.txt`}>llms.txt</a> is the index of everything below.
            </li>
            <li>
              <a href={`${SITE_ORIGIN}/ai/tokens.md`}>ai/tokens.md</a> lists every semantic token
              and when to use it.
            </li>
            <li>
              <code>ai/&lt;Component&gt;.md</code> is one component's full spec. The{" "}
              <strong>Copy for AI</strong> button on each component page copies the same content.
            </li>
            <li>
              <a href={`${SITE_ORIGIN}/llms-full.txt`}>llms-full.txt</a> is all of it in one file.
              It's large, so prefer the index for most agents.
            </li>
          </ul>
        </DocsSection>
      </DocsProse>
    </>
  );
}
