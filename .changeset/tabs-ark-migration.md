---
"@ui-organized/react": major
---

Tabs: migrate from Base UI to Ark UI's tabs.

The public `tabs` API is unchanged. Internally `Tab`→`Trigger` and
`Panel`→`Content`; the selected-tab styling now keys off `[data-selected]`
(was `[data-active]`). Zag tabs are string-keyed, so numeric tab `value`s are
coerced to strings and `onValueChange` reports string values. Inactive panels
are hidden via the `hidden` attribute (kept mounted) rather than unmounted.
