---
"@ui-organized/react": major
---

Field / Fieldset (and the inputs built on it: Input, TextArea, SearchInput,
PasswordInput): migrate the underlying primitive from Base UI to Ark UI.

The composable `Field.*` facade types are re-authored (they were
`ComponentProps<typeof BaseField.*>`):

- `FieldErrorMessageProps` no longer accepts Base UI's `match` prop — Ark's
  ErrorText shows automatically when the Field is `invalid`.
- `FieldControlProps` now types a native `<input>` (Ark splits the generic
  control into `Field.Input` / `Field.Textarea`); the `FieldControl` facade part
  renders an input.

DOM / attribute shift: emits Zag/Ark's field wiring and `data-*` instead of Base
UI's. Notably Ark does not emit `data-filled`, so the "filled control" styling
now keys off `:not(:placeholder-shown)` (fields are expected to carry a
placeholder). The documented props of `Input`/`TextArea`/`SearchInput`/
`PasswordInput` are unchanged.
