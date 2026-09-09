/**
 * React layer — base plus the two rule families that catch real bugs in this
 * repo: hook correctness, and static JSX accessibility.
 *
 * jsx-a11y is deliberately part of *lint*, not only of the axe gate. axe runs
 * against a rendered story, so it can only ever see the props a story happens to
 * pass; jsx-a11y reads the source and catches the violation in components and
 * code paths no story exercises. The two overlap, and that redundancy is the
 * point — they fail at different times, on different evidence.
 */
import jsxA11y from "eslint-plugin-jsx-a11y";
import reactHooks from "eslint-plugin-react-hooks";
import base from "./base.js";

/** @type {import("eslint").Linter.Config[]} */
const config = [
  ...base,

  {
    // Hooks are registered for .ts as well as .tsx: this repo keeps most custom
    // hooks in plain .ts files (useNavIndicator.ts, useA11yScan.ts, …). Without
    // .ts here their `eslint-disable react-hooks/exhaustive-deps` comments
    // reference a rule that isn't loaded, which is itself an error.
    files: ["**/*.{jsx,ts,tsx}"],
    plugins: { "react-hooks": reactHooks },
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
  },

  {
    // jsx-a11y only ever has anything to say about JSX.
    files: ["**/*.{jsx,tsx}"],
    plugins: { "jsx-a11y": jsxA11y },
    settings: {
      // The design system re-exports Ark UI primitives under its own names, so
      // jsx-a11y has to be told which of our components render which element —
      // otherwise `<Button as="a">` and friends are invisible to it.
      "jsx-a11y": {
        polymorphicPropName: "as",
        components: {
          Button: "button",
          Input: "input",
          SearchInput: "input",
          PasswordInput: "input",
          TextArea: "textarea",
          Divider: "hr",
          Card: "div",
        },
      },
    },
    rules: {
      // ── Accessibility ────────────────────────────────────────────────────
      "jsx-a11y/alt-text": "error",
      "jsx-a11y/anchor-has-content": "error",
      "jsx-a11y/anchor-is-valid": "error",
      "jsx-a11y/aria-activedescendant-has-tabindex": "error",
      "jsx-a11y/aria-props": "error",
      "jsx-a11y/aria-proptypes": "error",
      "jsx-a11y/aria-role": ["error", { ignoreNonDOM: true }],
      "jsx-a11y/aria-unsupported-elements": "error",
      "jsx-a11y/autocomplete-valid": "error",
      "jsx-a11y/heading-has-content": "error",
      "jsx-a11y/iframe-has-title": "error",
      "jsx-a11y/img-redundant-alt": "error",
      "jsx-a11y/interactive-supports-focus": "error",
      "jsx-a11y/label-has-associated-control": ["error", { assert: "either", depth: 3 }],
      "jsx-a11y/media-has-caption": "warn",
      "jsx-a11y/mouse-events-have-key-events": "error",
      "jsx-a11y/no-autofocus": ["warn", { ignoreNonDOM: true }],
      "jsx-a11y/no-noninteractive-element-interactions": "warn",
      // `region` is allowed alongside the default `tabpanel`: axe's own
      // `scrollable-region-focusable` rule *requires* tabIndex on a scrollable
      // container, so flagging it here would put our two a11y gates in direct
      // contradiction. A named region is the accessible way to satisfy both.
      "jsx-a11y/no-noninteractive-tabindex": [
        "error",
        { tags: [], roles: ["tabpanel", "region"], allowExpressionValues: true },
      ],
      "jsx-a11y/no-redundant-roles": "error",
      "jsx-a11y/no-static-element-interactions": "warn",
      "jsx-a11y/role-has-required-aria-props": "error",
      "jsx-a11y/role-supports-aria-props": "error",
      "jsx-a11y/scope": "error",
      "jsx-a11y/tabindex-no-positive": "error",
    },
  },
];

export default config;
