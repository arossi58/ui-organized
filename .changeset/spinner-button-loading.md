---
"@ui-organized/core": minor
"@ui-organized/react": minor
"@ui-organized/svelte": minor
"@ui-organized/vue": minor
"@ui-organized/angular": minor
---

Spinner, and a Button that can load, link and sit in text.

- **Spinner** is new in all four libraries (`UioSpinner` in Angular). It's a ring in the current text colour, in four sizes: sm, md and lg match a control's icon (16, 20 and 24 px), and xl (40 px) is for a region loading on its own. Standalone it is a `status` region named by `label`; mark it `decorative` when something nearby already announces the work. Under a reduced-motion preference it turns slowly rather than stopping.
- **Button `loading`** shows a spinner in the icon's place, or at the leading edge when there is no icon. The button keeps its focus and its label, is marked `aria-busy` and `aria-disabled` rather than `disabled`, and ignores clicks, so a submit button can't submit twice.
- **Button `href`** (React, Svelte, Vue) renders a real `<a>` with the button's appearance, passing `target`, `rel` and `download` through. Disabled or loading, the anchor drops its `href` and is marked `aria-disabled`. In Angular, write `<a uioButton href>` as before; `loading` works on it too.
- **Two new intents**, `link` and `link-neutral`: brand-coloured and secondary-text actions with no box, padding or fixed height, underlined on hover, for an action inside a sentence, a card footer or a row of metadata.
