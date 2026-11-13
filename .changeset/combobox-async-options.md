---
"@ui-organized/react": patch
"@ui-organized/svelte": patch
"@ui-organized/vue": patch
"@ui-organized/angular": patch
---

A Combobox whose value is set before its options load now shows the selected option's label once the options arrive. Before, the input stayed empty with the placeholder showing until someone opened the combobox, even though the value was selected. This affected any list fetched after the form was filled in, such as a saved setting meeting a list loaded from an API.

The label is filled in only while the combobox is closed and its input is empty. Text someone is typing is never replaced, including when the options are refetched or rebuilt as they type.
