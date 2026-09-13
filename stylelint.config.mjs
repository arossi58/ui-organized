/**
 * Stylelint — the CSS half of token validation.
 *
 * The existing token contract (packages/react/scripts/token-contract.ts) answers
 * "does every token this CSS consumes actually exist?". It cannot answer the
 * opposite question: "is this CSS consuming tokens at all, or has someone typed
 * a hex code?" A literal colour is invisible to the contract precisely because
 * it never references a token — and it is exactly what breaks a theme, since no
 * theme can restyle a value that was hard-coded.
 *
 * Scope is `packages/react/src/**` — the published component styles, where the
 * theming contract has to hold. App CSS is not held to this: the marketing site
 * and builder legitimately have one-off chrome that is not part of the design
 * system's surface.
 */
export default {
  ignoreFiles: ["**/node_modules/**", "**/dist/**", "**/storybook-static/**"],

  rules: {
    // ── Colours must come from tokens ────────────────────────────────────────
    // A literal hex in a component stylesheet is a value no theme can reach.
    // Translucent overlays (`rgba(0 0 0 / .25)` in a shadow) stay legal: they
    // are compositing, not palette, and there is no token for "25% black".
    "color-no-hex": true,
    "color-named": "never",

    // ── Structural correctness ───────────────────────────────────────────────
    "declaration-block-no-duplicate-properties": [
      true,
      // Deliberate fallback stacks (`display: flex; display: grid`) are a real
      // technique; silently-repeated identical declarations are not.
      { ignore: ["consecutive-duplicates-with-different-values"] },
    ],
    "declaration-block-no-shorthand-property-overrides": true,
    "no-duplicate-selectors": true,
    "no-descending-specificity": null, // too noisy for state-heavy component CSS
    "block-no-empty": true,
    "no-invalid-double-slash-comments": true,
    "property-no-unknown": true,
    "unit-no-unknown": true,
    "selector-pseudo-class-no-unknown": true,
    "selector-pseudo-element-no-unknown": true,
    "at-rule-no-unknown": true,
    "function-no-unknown": true,

    // ── `!important` ─────────────────────────────────────────────────────────
    // Warned, not banned. There is one legitimate use in the package
    // (base.css restoring `[hidden]`), and it is annotated; anything else should
    // have to justify itself in review rather than be silently normal.
    "declaration-no-important": [true, { severity: "warning" }],
  },

  overrides: [
    {
      // base.css exists specifically to out-rank component CSS. See its header.
      // It lives in `core` now, not `react` — every library needs the rule, and
      // it reached React alone while it sat there. The glob followed it: left
      // pointing at the old path, the one deliberate `!important` in the repo
      // started emitting the warning this override exists to suppress.
      files: ["packages/core/src/base.css"],
      rules: { "declaration-no-important": null },
    },
  ],
};
