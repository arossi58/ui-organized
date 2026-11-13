/**
 * The anti-hallucination prose for `ai-context.ts` (Connect.md §6.4, §7.2).
 *
 * Split out from the renderer on purpose: this wording gets tuned by hand as we
 * observe real agents failing in real ways, and those diffs should be readable
 * without layout logic mixed in.
 *
 * Every rule here earns its place by preventing a specific, observed failure. If
 * you add one, name the failure it stops — context length is not free, and a rule
 * that stops nothing dilutes the ones that do.
 */

import type { ComponentManifestEntry } from "./schema.js";

/**
 * Design-token families a component may legitimately be positioned with. We list
 * the families rather than dumping every token: an agent that knows the shape
 * `var(--color-…)` will look one up, whereas 3,000 tokens of values crowd out the
 * prop table it actually needs.
 */
// Verified against packages/tokens/output/variables.css — note the spacing family
// is `--spacing-space-*`, NOT `--space-*`. Naming a family that doesn't exist
// would have an agent emit `var(--space-04)`, which resolves to nothing: exactly
// the confident-but-wrong output this document is here to prevent.
export const TOKEN_FAMILIES = [
  "var(--color-…)",
  "var(--spacing-space-…)",
  "var(--border-radius-…)",
  "var(--type-size-…)",
] as const;

/**
 * How the token names are built. Agents guess a 100–900 numeric scale
 * (`--spacing-space-200`, `--type-size-200`) because most systems use one; this
 * system doesn't, and the eval caught exactly those inventions. Stating the
 * pattern beats listing every name in every rule.
 */
export const TOKEN_NAMING =
  "Token names are not a 100–900 scale. Spacing steps run `--spacing-space-005` (2px), " +
  "`-01` (4px), `-02` (8px), `-04` (16px) up to `-32` (128px); type sizes are named by role, " +
  "e.g. `--type-size-body-medium`, `--type-size-heading-small`. A `-100` or `-200` suffix " +
  "does not exist.";

/**
 * Derived, component-specific warnings. Nothing here is stored in the manifest —
 * it's all computed from the entry's own prop set, so it stays correct as the
 * code changes and costs no authoring.
 *
 * `customInstructions` is the place for guidance that genuinely cannot be derived.
 */
export function derivePropHints(entry: ComponentManifestEntry): string[] {
  const names = new Set(entry.props.map((p) => p.name));
  const hints: string[] = [];

  // The single most common miss: agents reach for shadcn/MUI's `variant` on
  // components whose emphasis axis is named `intent`, and vice versa.
  if (names.has("intent") && !names.has("variant")) {
    hints.push("`variant` is NOT a prop of this component — the emphasis axis is `intent`.");
  } else if (names.has("variant") && !names.has("intent")) {
    hints.push("`intent` is NOT a prop of this component — the emphasis axis is `variant`.");
  }

  // `icon` takes a NAME or a component, never an element. Agents habitually
  // pass `icon={<Trash />}` because that's the react-icons convention. And the
  // name is the icon library's own: there is no renamed vocabulary to recall,
  // so an agent must not invent one (`close` for Lucide's `x`).
  const icon = entry.props.find((p) => p.name === "icon");
  if (icon && /\bIconName\b/.test(icon.type)) {
    hints.push(
      "`icon` takes the active icon library's own name for the icon, exactly as the library " +
        'publishes it (Lucide `"x"`, Heroicons `"x-mark"`; names are not translated between ' +
        "libraries), registered once with `registerIcons`. Or pass the icon component itself " +
        "(`icon={Trash2}`) — never an element (`icon={<Trash2 />}`).",
    );
  } else if (icon && !/ReactNode|ReactElement|ComponentType|JSX\.Element/.test(icon.type)) {
    hints.push(
      "`icon` takes an icon NAME string from the list below, not a React element — " +
        "never `icon={<SomeIcon />}`.",
    );
  }

  return hints;
}

/**
 * The rules block, rendered before any data.
 *
 * Order matters: an agent that reads the prop table first is already anchored on
 * its priors about what a "Button" looks like, and a constraint arriving after
 * that anchor is much weaker than one arriving before it.
 */
export function globalRules(packageName: string, hints: string[]): string[] {
  const propRule =
    "The props table below is this component's COMPLETE own API. If a prop you want " +
    "is not listed, it does not exist — do not invent it and do not rename one." +
    (hints.length ? ` ${hints.join(" ")}` : "");

  return [
    `Import ONLY from \`${packageName}\`. Never from a relative path, \`shadcn/ui\`, ` +
      "`@/components/ui/*`, or any other library. Never re-declare or re-implement " +
      "this component.",
    propRule,
    "Union props are closed sets. A value not listed below is invalid.",
    "Do not style this component with utility classes, hex colors, or px literals. " +
      "Vary it with its props. If extra layout is genuinely required, use design " +
      `tokens only — ${TOKEN_FAMILIES.map((t) => `\`${t}\``).join(", ")}. ${TOKEN_NAMING}`,
    "Do not wrap or fork this component to add a variant.",
    "If the design needs something this component cannot express, say so — do not " +
      "approximate it with custom markup.",
  ];
}

/**
 * The same rules for a whole project rather than one component, written into a
 * consumer's agent files by `uiorg init`. Keep these in step with `globalRules`;
 * they're beside it so a change to one shows up next to the other.
 */
/**
 * How each library's markup differs from React's, in the terms an agent
 * writing that markup needs. One rule each; the spec of every component
 * carries the details.
 */
const FRAMEWORK_CONVENTIONS: Record<"svelte" | "vue" | "angular", string> = {
  svelte:
    "Write Svelte 5: pass content as `children` and named snippets, style with `class` (never " +
    "`className`), use `bind:` for two-way values and `on…` callback props for events, exactly " +
    "as each spec's prop table names them.",
  vue:
    "Write Vue 3 `<script setup>`: bind a component's value with `v-model` (its `modelValue` " +
    "prop), listen with `@event` (a spec's `onValueChange` is `@value-change`), pass content " +
    "through slots, and use `asChild` to render a slot's root element as the component.",
  angular:
    "Write standalone Angular: import each `Uio…` class you use into the component's " +
    "`imports`. Many components are directives on a native element — use the selector from " +
    "the spec (`<button uioButton>`), bind inputs with `[input]`, two-way values with " +
    "`[(model)]`, and outputs with `(output)`.",
};

/** The markup `get_figma_frame` hands back, per library. */
const FRAME_OUTPUT: Record<"react" | "svelte" | "vue" | "angular", string> = {
  react: "compact JSX",
  svelte: "compact Svelte markup",
  vue: "a compact Vue template",
  angular: "a compact Angular template",
};

export function projectRules(
  packageName: string,
  framework: "react" | "svelte" | "vue" | "angular" = "react",
): string[] {
  const specPath = framework === "react" ? "/ai/<Component>.md" : `/ai/${framework}/<Component>.md`;
  const index = framework === "react" ? "/llms.txt" : `/llms-${framework}.txt`;
  return [
    `Build UI from \`${packageName}\`, importing only from that package. Never from a ` +
      "relative path, `shadcn/ui`, `@/components/ui/*`, or any other component library. " +
      "Never re-declare, wrap or fork a component to add a variant.",
    "Before using a component, read its spec: the `get_component` MCP tool, or " +
      `https://uiorganized.com${specPath}. To find one, use \`search_components\` or ` +
      `https://uiorganized.com${index}. A prop, value or component that isn't in the spec ` +
      "does not exist. Union props are closed sets.",
    ...(framework === "react" ? [] : [FRAMEWORK_CONVENTIONS[framework]]),
    "Vary components with their props. For custom layout and custom elements, use design " +
      `tokens only — ${TOKEN_FAMILIES.map((t) => `\`${t}\``).join(", ")} — never utility ` +
      "classes, hex colours or px literals. Check a name with `search_tokens` or " +
      "https://uiorganized.com/ai/tokens.md first. A token that isn't listed resolves to nothing. " +
      TOKEN_NAMING,
    "For a Figma link, read the frame with Figma's own MCP server (`get_design_context`), " +
      "then call `get_component` for each component it shows and pass each Figma variable " +
      "name it reports to `get_token`. `get_figma_frame` returns real components and tokens " +
      `as ${FRAME_OUTPUT[framework]} only once the library's components are linked to Figma, ` +
      "and `found:false` until then. Report anything left unmapped or unbound rather than " +
      "rebuilding it by eye.",
    "If the design needs something the system can't express, say so. Do not approximate it " +
      "with custom markup, and do not invent a component, prop or token.",
  ];
}

/**
 * Why this exists: the scanner reads a component's OWN declared members and
 * deliberately skips inherited DOM attributes (scan-react.ts), so `children`,
 * `onClick`, `disabled` and `className` are absent from `props` for most entries.
 * Without this note an agent reads the table as exhaustive and refuses to attach
 * a click handler — a failure mode that reads as the component being broken.
 *
 * Kept element-agnostic: the manifest doesn't record which HTML element a
 * component extends, and inventing one here would be exactly the kind of
 * confident-but-unverified claim this whole document exists to prevent.
 */
export const PASSTHROUGH_NOTE =
  "Beyond the props above, this component forwards the standard React props of its " +
  "underlying element — `children`, `className`, `id`, `style`, `ref`, its native " +
  "event handlers (`onClick`, `onChange`, …), and `aria-*` / `data-*` attributes. " +
  "Those are the ONLY additions; they do not extend the variant API above.";

/**
 * {@link PASSTHROUGH_NOTE} in each other library's terms. The same claim —
 * these are the only additions — in the syntax that library forwards them with.
 */
export const FRAMEWORK_PASSTHROUGH_NOTES = {
  svelte:
    "Beyond the props above, this component forwards the standard attributes of its " +
    "underlying element — `class`, `id`, `style`, its native event handlers (`onclick`, " +
    "`oninput`, …), and `aria-*` / `data-*` attributes. Those are the ONLY additions; they " +
    "do not extend the variant API above.",
  vue:
    "Beyond the props above, standard attributes fall through to the underlying element — " +
    "`class`, `id`, `style`, native listeners (`@click`, `@input`, …), and `aria-*` / " +
    "`data-*` attributes. Those are the ONLY additions; they do not extend the variant API " +
    "above.",
  angular:
    "The host element is your own, so its standard attributes and native events " +
    "(`class`, `id`, `(click)`, `aria-*`, `data-*`) go on it directly. Those are the ONLY " +
    "additions; they do not extend the inputs above.",
} as const;

/** Repeated at the very end — recency matters as much as primacy. */
export const CLOSING_RULE =
  "If you need a prop, a value, or a component that is not in this document, stop " +
  "and ask — do not invent one.";

/** Scoping note added to rule 2 for compound components. */
export const COMPOUND_SCOPE_NOTE =
  "The props table applies to the root component only. Its subcomponents are layout " +
  "containers that take `children` plus standard element attributes — do not pass " +
  "the root's variant props to them.";

/**
 * The skill `uiorg init` installs for building from a Figma link with Figma's OWN
 * MCP server (`get_design_context`). That is the route until the library's
 * components are linked to Figma: `get_figma_frame` matches nodes by component
 * key, and with no keys in the manifest it can only answer `found:false`.
 * Figma's output is React + Tailwind with Figma variable names; this turns it
 * into the project's library and real tokens, and says what to do where Figma
 * didn't identify a component.
 */
export function figmaSkillMarkdown(
  packageName: string,
  framework: "react" | "svelte" | "vue" | "angular" = "react",
): string {
  const lib = { react: "React", svelte: "Svelte", vue: "Vue", angular: "Angular" }[framework];
  return `---
name: ui-organized-figma
description: Build a Figma design or component with ${packageName}. Use whenever the user shares a figma.com link, or asks to implement, build or code a Figma design, screen or component in this project.
---

# Figma design → ${packageName}

Two MCP servers work together here. Figma's MCP shows what the design is; the
\`ui-organized\` MCP says what code it becomes. Never ship Figma's generated
markup: it is React and Tailwind written from layers, not this project's code.

## 1. Read the frame

- Call Figma's \`get_design_context\` on the node, with the screenshot. The
  screenshot is the visual target. The code is a reference, not the answer.
- \`ui-organized\`'s \`get_figma_frame\` reads a frame straight into ${lib} code,
  but only once the library's components are linked to Figma (and a
  \`FIGMA_TOKEN\` is set). Until then it returns \`found:false\`, and the steps
  below are the route. If it does return a frame, use that, and the rest of this
  skill for anything it lists as \`unmapped\` or \`unbound\`.

## 2. Map every component to ${packageName}

- Figma's output names library components (functions such as \`Chip\`,
  \`ChipSegment\`) and passes on each component's description, which says what it
  is in code ("Code: <Chip label operator value> from @ui-organized/react"). Layer
  names (\`data-name\`) often name the rest.
- For each one, call \`get_component\` on \`ui-organized\` and use that spec: its
  import, its props and their allowed values. Figma's variant values usually
  equal the prop values (\`intent=ghost\` → \`intent="ghost"\`); \`state\` values
  such as \`hover\` are interaction states, not props, except \`disabled\`.
- Something drawn as plain \`div\`s that looks like a library component (a button,
  an input) is still that component: confirm it with \`search_components\`, and
  never rebuild a library component from markup.
- If \`get_component\` returns \`found:false\`, the component does not exist in
  ${packageName}. Say so; do not invent one or borrow another library's.

## 3. Turn Figma's tokens into real ones

- Figma writes variables as \`var(--spacing/space-02,8px)\` or
  \`var(--content/primary,#030303)\`. Pass each to \`get_token\`: it returns the CSS
  token (\`--spacing-space-02\`, \`--color-content-primary\`), or \`found:false\`.
- Never keep the fallback value (\`8px\`, \`#030303\`), and never copy a raw hex or
  px value from Figma's code. A value with no variable is unbound: report it.

## 4. Write it

${projectRules(packageName, framework).map((rule) => `- ${rule}`).join("\n")}

Finish by listing anything that stayed unmapped or unbound, so the designer can
fix it in Figma rather than the code approximating it.
`;
}
